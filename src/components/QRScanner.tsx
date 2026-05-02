import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

interface QRScannerProps {
  onScan: (id: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    const onScanSuccess = (decodedText: string) => {
      // Decode patient ID from QR (assuming format is patient:ID or just ID)
      const patientId = decodedText.startsWith('patient:') 
        ? decodedText.split(':')[1] 
        : decodedText;
      
      scanner.clear();
      onScan(patientId);
    };

    const onScanFailure = (error: any) => {
      // Silently handle scan errors
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(err => console.error("Failed to clear scanner", err));
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="p-10">
          <h2 className="text-2xl font-black text-slate-900 mb-2">Scan Health QR</h2>
          <p className="text-slate-500 font-medium mb-8">Point the camera at the patient's MedVault QR code.</p>
          
          <div className="relative group">
            <div id="qr-reader" className="overflow-hidden rounded-3xl border-4 border-slate-900 shadow-2xl bg-black"></div>
            {/* Scanning Line Overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              <div className="w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] absolute top-0 animate-[scan_2s_linear_infinite]"></div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Camera permission required to scan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
