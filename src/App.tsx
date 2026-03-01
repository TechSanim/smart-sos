/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Smartphone, 
  Cpu, 
  Info, 
  Play, 
  CheckCircle2, 
  MapPin, 
  MessageSquare, 
  Bluetooth, 
  Battery,
  ExternalLink,
  UserPlus,
  Trash2,
  Phone,
  Home,
  Settings,
  Activity,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Tab = 'home' | 'device' | 'contacts' | 'logs';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [simStatus, setSimStatus] = useState<'idle' | 'connected' | 'emergency'>('idle');
  const [isPaired, setIsPaired] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [logs, setLogs] = useState<{msg: string, time: string}[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<string[]>(() => {
    const saved = localStorage.getItem('sos_contacts');
    return saved ? JSON.parse(saved) : [];
  });
  const [newContact, setNewContact] = useState('');

  useEffect(() => {
    localStorage.setItem('sos_contacts', JSON.stringify(emergencyContacts));
  }, [emergencyContacts]);

  const addContact = () => {
    const trimmed = newContact.trim();
    if (!trimmed) return;
    
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length < 7) {
      alert("Please enter a valid phone number.");
      return;
    }

    if (emergencyContacts.length < 3) {
      setEmergencyContacts([...emergencyContacts, trimmed]);
      setNewContact('');
      addLog(`System: Added contact ${trimmed}`);
    }
  };

  const removeContact = (index: number) => {
    const updated = emergencyContacts.filter((_, i) => i !== index);
    setEmergencyContacts(updated);
    addLog(`System: Removed contact`);
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{msg, time}, ...prev].slice(0, 20));
  };

  const handleAddDevice = () => {
    addLog("BLE: Scanning for devices...");
    setTimeout(() => {
      setIsPaired(true);
      addLog("BLE: Found 'SOS-Locket'. Device added.");
    }, 1500);
  };

  const handleSimConnect = () => {
    setSimStatus('connected');
    addLog("BLE: Connected to SOS-Locket");
  };

  const handleSimSOS = () => {
    if (simStatus !== 'connected') {
      alert("Please connect the locket first!");
      return;
    }
    
    // Haptic feedback simulation
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    setSimStatus('emergency');
    addLog("BLE: Received 'SOS' signal!");
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        addLog(`GPS: Location acquired (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
        const contactList = emergencyContacts.length > 0 ? emergencyContacts.join(', ') : 'emergency contacts';
        addLog(`SMS: Emergency message sent to ${contactList}.`);
      }, (err) => {
        addLog("GPS Error: Could not get location.");
        const contactList = emergencyContacts.length > 0 ? emergencyContacts.join(', ') : 'emergency contacts';
        addLog(`SMS: Sent fallback emergency message to ${contactList}.`);
      });
    }
  };

  const resetSim = () => {
    setSimStatus('connected');
    setLocation(null);
    addLog("System: Reset to secure state.");
  };

  const estimatedTime = (batteryLevel * 1.5).toFixed(0);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-blue-500/30 flex flex-col">
      {/* App Header */}
      <header className="bg-black/50 backdrop-blur-xl sticky top-0 z-50 pt-safe">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="text-black w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-lg leading-none tracking-tight text-white">SOSphere</h1>
              <span className="text-[8px] uppercase tracking-[0.2em] text-blue-500/80 font-bold">Smart Safety System</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${simStatus === 'connected' ? 'bg-cyan-500 animate-pulse' : simStatus === 'emergency' ? 'bg-red-500 animate-ping' : 'bg-gray-600'}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {simStatus === 'idle' ? 'Offline' : simStatus === 'connected' ? 'Online' : 'SOS'}
            </span>
          </div>
        </div>
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500/80 to-transparent shadow-[0_0_10px_rgba(59,130,246,0.3)] relative -top-[2px]" />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <section className="space-y-2">
                  <h2 className="text-3xl font-black text-white tracking-tight">
                    Safety in your <span className="text-blue-500 italic">pocket.</span>
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    A complete end-to-end solution for emergency response, 
                    ensuring immediate help is just a button press away.
                  </p>
                </section>

                {/* Status Card */}
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">System Status</p>
                      <p className={`text-xl font-bold ${simStatus === 'emergency' ? 'text-red-500' : 'text-white'}`}>
                        {simStatus === 'idle' ? 'Disconnected' : simStatus === 'connected' ? 'Secure' : 'Emergency Alert'}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      simStatus === 'idle' ? 'bg-gray-500/10 text-gray-500' : 
                      simStatus === 'connected' ? 'bg-cyan-500/10 text-cyan-500' : 
                      'bg-red-500/10 text-red-500'
                    }`}>
                      <Bluetooth className="w-6 h-6" />
                    </div>
                  </div>

                  {simStatus !== 'idle' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Battery</p>
                          <p className="text-lg font-bold text-white">{batteryLevel}%</p>
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium">~{estimatedTime} mins left</p>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${batteryLevel}%` }}
                          className={`h-full ${batteryLevel < 20 ? 'bg-red-500' : 'bg-cyan-500'}`}
                        />
                      </div>
                    </div>
                  )}

                  {simStatus === 'emergency' && (
                    <button 
                      onClick={resetSim}
                      className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-transform"
                    >
                      I am Safe
                    </button>
                  )}
                </div>

                {/* Info Card */}
                <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    Safety Tip
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Keep your SOS-Locket within 10 meters of your phone for a stable connection. Ensure Bluetooth is always enabled.
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {[
                    {
                      icon: Bluetooth,
                      title: "BLE Connectivity",
                      desc: "Low Energy Bluetooth ensures the locket stays connected for weeks on a single charge."
                    },
                    {
                      icon: MapPin,
                      title: "GPS Tracking",
                      desc: "Automatically grabs precise coordinates and generates a Google Maps link for rescuers."
                    },
                    {
                      icon: MessageSquare,
                      title: "Instant SMS",
                      desc: "Sends pre-configured emergency messages to family and authorities instantly."
                    }
                  ].map((feature, i) => (
                    <div key={i} className="p-5 rounded-3xl bg-white/5 border border-white/5 flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0">
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">{feature.title}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* How it Works Section */}
                <section className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-500" />
                    How it works
                  </h3>
                  <div className="space-y-4">
                    {[
                      { step: "1", title: "The Locket", desc: "An ESP32-based wearable device that acts as a BLE Server." },
                      { step: "2", title: "The Connection", desc: "Your phone pairs with the locket. The app runs in the background, listening for a specific 'SOS' notification." },
                      { step: "3", title: "The Trigger", desc: "When the user presses the button on the locket, it sends an 'SOS' string over Bluetooth." },
                      { step: "4", title: "The Response", desc: "The app receives the signal, fetches the current GPS location, and sends an SMS with a Google Maps link to emergency contacts." }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500 text-[10px] font-bold flex-shrink-0">
                          {item.step}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white">{item.title}</p>
                          <p className="text-[11px] text-gray-500 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'device' && (
              <motion.div
                key="device"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                <section className="space-y-2">
                  <h2 className="text-3xl font-black text-white tracking-tight">Device.</h2>
                  <p className="text-gray-400 text-sm">Manage your hardware connection.</p>
                </section>

                <div className="space-y-6">
                  {/* Pair Section */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                        <Cpu className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">SOS-Locket</h3>
                        <p className="text-xs text-gray-500">{isPaired ? 'Paired (ID: SOS-LKT-001)' : 'Not Paired'}</p>
                      </div>
                    </div>

                    {!isPaired ? (
                      <button 
                        onClick={handleAddDevice}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                      >
                        <Bluetooth className="w-5 h-5" />
                        Pair New Device
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <button 
                            onClick={handleSimConnect}
                            disabled={simStatus !== 'idle'}
                            className="flex-1 py-3 bg-white/10 text-white text-sm font-bold rounded-xl disabled:opacity-50"
                          >
                            {simStatus === 'idle' ? 'Connect' : 'Connected'}
                          </button>
                          <button 
                            onClick={() => { setIsPaired(false); setSimStatus('idle'); }}
                            className="px-4 py-3 bg-red-500/10 text-red-500 text-sm font-bold rounded-xl"
                          >
                            Unpair
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Test Section */}
                  {isPaired && simStatus !== 'idle' && (
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                      <h3 className="font-bold text-white">Signal Test</h3>
                      <p className="text-xs text-gray-400">Simulate a button press on your locket to test the emergency response.</p>
                      <div className="flex justify-center py-4">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={handleSimSOS}
                          className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all ${
                            simStatus === 'emergency' 
                              ? 'bg-red-600 shadow-red-600/50 animate-pulse' 
                              : 'bg-blue-600 shadow-blue-600/30'
                          }`}
                        >
                          <span className="text-white font-black text-2xl">SOS</span>
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'contacts' && (
              <motion.div
                key="contacts"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <section className="space-y-2">
                  <h2 className="text-3xl font-black text-white tracking-tight">Contacts.</h2>
                  <p className="text-gray-400 text-sm">Who should we alert in an emergency?</p>
                </section>

                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white">Emergency List</h3>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{emergencyContacts.length}/3</span>
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="tel"
                        value={newContact}
                        onChange={(e) => setNewContact(e.target.value)}
                        placeholder="Phone number"
                        disabled={emergencyContacts.length >= 3}
                        className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
                      />
                      <button 
                        onClick={addContact}
                        disabled={!newContact.trim() || emergencyContacts.length >= 3}
                        className="w-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center disabled:bg-gray-800 transition-colors"
                      >
                        <UserPlus className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {emergencyContacts.map((contact, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                              <Phone className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-white">{contact}</span>
                          </div>
                          <button 
                            onClick={() => removeContact(index)}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      {emergencyContacts.length === 0 && (
                        <div className="py-12 text-center space-y-2">
                          <Users className="w-12 h-12 text-gray-800 mx-auto" />
                          <p className="text-xs text-gray-600">No emergency contacts saved.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'logs' && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <section className="space-y-2">
                  <h2 className="text-3xl font-black text-white tracking-tight">Activity.</h2>
                  <p className="text-gray-400 text-sm">Review recent system events.</p>
                </section>

                <div className="space-y-4">
                  {location && (
                    <div className="p-4 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-4">
                      <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center text-black">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white">Last Emergency Location</p>
                        <p className="text-[10px] text-gray-500 truncate">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                      </div>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-white/5 rounded-xl text-gray-400"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                      <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        System Logs
                      </h3>
                    </div>
                    <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto font-mono text-[11px]">
                      {logs.length === 0 && <p className="text-gray-700 italic text-center py-8">No activity recorded.</p>}
                      {logs.map((log, i) => (
                        <div key={i} className="flex gap-4 border-l-2 border-white/5 pl-4 py-1">
                          <span className="text-gray-600 whitespace-nowrap">{log.time}</span>
                          <span className={log.msg.includes('Emergency') || log.msg.includes('SOS') ? 'text-red-400 font-bold' : 'text-gray-400'}>
                            {log.msg}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 pb-safe z-50">
        <div className="max-w-xl mx-auto px-6 h-20 flex items-center justify-between">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'device', icon: Smartphone, label: 'Device' },
            { id: 'contacts', icon: Users, label: 'Contacts' },
            { id: 'logs', icon: Activity, label: 'Activity' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex flex-col items-center gap-1.5 transition-all ${
                activeTab === item.id ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className={`p-2 rounded-xl transition-colors ${activeTab === item.id ? 'bg-blue-500/10' : ''}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
