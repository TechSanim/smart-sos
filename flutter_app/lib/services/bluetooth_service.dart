import 'dart:async';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:permission_handler/permission_handler.dart';

class BluetoothService {
  BluetoothDevice? _connectedDevice;
  StreamSubscription? _scanSubscription;
  StreamSubscription? _notifySubscription;

  Future<void> requestPermissions() async {
    await [
      Permission.bluetoothScan,
      Permission.bluetoothConnect,
      Permission.bluetoothAdvertise,
    ].request();
  }

  void startScanning(Function(BluetoothDevice) onDeviceFound, Function(bool) onConnectionChanged, Function() onSOSReceived, Function(int) onBatteryLevelReceived) {
    FlutterBluePlus.startScan(timeout: const Duration(seconds: 15));
    
    _scanSubscription = FlutterBluePlus.scanResults.listen((results) {
      for (ScanResult r in results) {
        if (r.device.platformName == "SOS-Locket") {
          _connectToDevice(r.device, onDeviceFound, onConnectionChanged, onSOSReceived, onBatteryLevelReceived);
          FlutterBluePlus.stopScan();
          break;
        }
      }
    });
  }

  Future<void> _connectToDevice(BluetoothDevice device, Function(BluetoothDevice) onDeviceFound, Function(bool) onConnectionChanged, Function() onSOSReceived, Function(int) onBatteryLevelReceived) async {
    onDeviceFound(device);
    await device.connect();
    _connectedDevice = device;
    onConnectionChanged(true);

    List<BluetoothService> services = await device.discoverServices();
    for (var service in services) {
      for (var characteristic in service.characteristics) {
        // Battery Service Characteristic (UUID 0x2A19)
        if (characteristic.uuid.toString().contains("2a19")) {
          var value = await characteristic.read();
          if (value.isNotEmpty) onBatteryLevelReceived(value[0]);
          
          await characteristic.setNotifyValue(true);
          characteristic.onValueReceived.listen((value) {
            if (value.isNotEmpty) onBatteryLevelReceived(value[0]);
          });
        }

        // SOS Characteristic
        if (characteristic.properties.notify && !characteristic.uuid.toString().contains("2a19")) {
          await characteristic.setNotifyValue(true);
          _notifySubscription = characteristic.onValueReceived.listen((value) {
            String message = String.fromCharCodes(value);
            if (message == "SOS") {
              onSOSReceived();
            }
          });
        }
      }
    }
  }

  void dispose() {
    _scanSubscription?.cancel();
    _notifySubscription?.cancel();
    _connectedDevice?.disconnect();
  }
}
