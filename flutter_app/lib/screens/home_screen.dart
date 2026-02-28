import 'dart:async';
import 'package:flutter/material.dart';
import '../services/bluetooth_service.dart';
import '../services/location_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final BluetoothService _bluetoothService = BluetoothService();
  final LocationService _locationService = LocationService();
  
  String _status = "No Device Added";
  bool _isEmergency = false;
  bool _isConnected = false;
  int _batteryLevel = 0;

  @override
  void initState() {
    super.initState();
    _initSystem();
  }

  Future<void> _initSystem() async {
    await _locationService.requestPermissions();
    await _bluetoothService.requestPermissions();
  }

  void _addDevice() {
    setState(() => _status = "Scanning for Locket...");
    _bluetoothService.startScanning((device) {
      setState(() => _status = "Connecting to ${device.platformName}...");
    }, (connected) {
      setState(() {
        _isConnected = connected;
        _status = connected ? "Connected" : "Disconnected";
      });
    }, () {
      _triggerEmergency();
    }, (level) {
      setState(() => _batteryLevel = level);
    });
  }

  Future<void> _triggerEmergency() async {
    if (_isEmergency) return;
    setState(() => _isEmergency = true);
    try {
      final position = await _locationService.getCurrentLocation();
      await _locationService.sendEmergencySMS(position);
      if (mounted) _showEmergencyDialog();
    } catch (e) {
      debugPrint("Emergency Trigger Error: $e");
    }
  }

  void _showEmergencyDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text("SOS ALERT SENT", style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
        content: const Text("Your emergency contacts have been notified with your live GPS location."),
        actions: [
          FilledButton(
            onPressed: () {
              setState(() => _isEmergency = false);
              Navigator.pop(context);
            },
            child: const Text("I AM SAFE"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Smart SOS Safety"),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            if (!_isConnected)
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: _addDevice,
                  icon: const Icon(Icons.bluetooth_searching),
                  label: const Text("Add SOS Locket"),
                  style: FilledButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            const SizedBox(height: 24),
            Card(
              elevation: 0,
              color: Theme.of(context).colorScheme.surfaceContainerHighest.withOpacity(0.3),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: Colors.white.withOpacity(0.1))),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text("Connection Status", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: _isConnected ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            _isConnected ? "Connected" : "Disconnected",
                            style: TextStyle(color: _isConnected ? Colors.green : Colors.red, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                    if (_isConnected) ...[
                      const Divider(height: 32),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.battery_charging_full, size: 20, color: _batteryLevel < 20 ? Colors.red : Colors.green),
                              const SizedBox(width: 8),
                              Text("$_batteryLevel%", style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          Text(
                            "Est. ${(_batteryLevel * 1.5).toStringAsFixed(0)} mins left",
                            style: const TextStyle(color: Colors.grey, fontSize: 12),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      LinearProgressIndicator(
                        value: _batteryLevel / 100,
                        backgroundColor: Colors.grey.withOpacity(0.2),
                        color: _batteryLevel < 20 ? Colors.red : Colors.green,
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 48),
            AnimatedContainer(
              duration: const Duration(milliseconds: 500),
              padding: const EdgeInsets.all(40),
              decoration: BoxDecoration(
                color: _isEmergency ? Colors.red.withOpacity(0.1) : Colors.green.withOpacity(0.1),
                shape: BoxShape.circle,
                border: Border.all(
                  color: _isEmergency ? Colors.red : Colors.green,
                  width: 4,
                ),
              ),
              child: Icon(
                _isEmergency ? Icons.warning_rounded : Icons.shield_rounded,
                size: 120,
                color: _isEmergency ? Colors.red : Colors.green,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              _isEmergency ? "EMERGENCY MODE ACTIVE" : "System Secure",
              style: TextStyle(
                color: _isEmergency ? Colors.red : Colors.grey,
                fontSize: 18,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
