'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { showToast, setActiveTab } from '@/features/ui/uiSlice';
import { addClient } from '@/modules/clients';
import { registerMember, RegisteredMember, MembershipPlan } from '@/features/gym/gymSlice';
import {
  User,
  Mail,
  Phone,
  Box,
  Clock,
  Camera,
  Check,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  ShieldCheck,
  ChevronDown,
  Plus,
  Minus,
  CheckCircle2,
  Trash2,
  Upload,
  RefreshCw,
  X,
  Sparkles,
} from 'lucide-react';

export default function AthleteRegistrationView() {
  const dispatch = useAppDispatch();
  const membershipPlans = useAppSelector((state) => state.gym.membershipPlans);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1998-04-12');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Realtime Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isConnectingCamera, setIsConnectingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Membership & Duration Selection
  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
    return membershipPlans?.[0]?.id || 'plan-starter-1m';
  });

  const selectedPlan: MembershipPlan | undefined = useMemo(() => {
    const found = membershipPlans.find((p) => p.id === selectedPlanId);
    return found || membershipPlans[0];
  }, [membershipPlans, selectedPlanId]);

  // Duration in Months (ticker stepper only)
  const [selectedDurationMonths, setSelectedDurationMonths] = useState<number>(() => {
    return selectedPlan?.durationMonths || 1;
  });

  // Keep duration synced when selecting a plan if user hasn't modified
  const handleSelectPlan = (plan: MembershipPlan) => {
    setSelectedPlanId(plan.id);
    setSelectedDurationMonths(plan.durationMonths || 1);
  };

  // Start Date
  const [startDate, setStartDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Calculate Expiration Date
  const calculatedExpiryDate = useMemo(() => {
    if (!startDate) return '';
    try {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + (selectedDurationMonths || 1));
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }, [startDate, selectedDurationMonths]);

  // Calculate Fee
  const calculatedFee = useMemo(() => {
    if (!selectedPlan) return 110;
    const baseDuration = selectedPlan.durationMonths || 1;
    const basePrice = selectedPlan.price;
    if (selectedDurationMonths === baseDuration) {
      return basePrice;
    }
    const monthlyRate = basePrice / baseDuration;
    return Math.round(monthlyRate * selectedDurationMonths);
  }, [selectedPlan, selectedDurationMonths]);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH' | 'BANK_TRANSFER'>('CARD');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentlyRegistered, setRecentlyRegistered] = useState<{
    name: string;
    regId: string;
    membershipType: string;
  } | null>(null);

  // Stop camera helper
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsConnectingCamera(false);
    setCameraError(null);
  };

  // Start camera device helper
  const startCamera = async () => {
    setCameraError(null);
    setIsConnectingCamera(true);
    setIsCameraActive(true);

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access API is not supported in this environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          // Ignore auto-play errors
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to connect to camera device';
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('notallowed') || msg.toLowerCase().includes('denied')) {
        setCameraError('Camera access permission was denied. Please grant camera permission in your browser or upload an image file.');
      } else if (msg.toLowerCase().includes('notfound') || msg.toLowerCase().includes('devicesnotfound')) {
        setCameraError('No camera hardware device found on this system. You can upload an image file below.');
      } else {
        setCameraError('Could not start camera feed. Please check device permissions or upload a photo.');
      }
    } finally {
      setIsConnectingCamera(false);
    }
  };

  // Attach stream to video tag whenever camera becomes active and element is ready
  useEffect(() => {
    if (isCameraActive && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isCameraActive]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Capture realtime frame snapshot
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = canvasRef.current || document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;
    const size = Math.min(width, height);

    canvas.width = 480;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const sx = (width - size) / 2;
      const sy = (height - size) / 2;
      ctx.drawImage(video, sx, sy, size, size, 0, 0, 480, 480);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setPhotoUrl(dataUrl);
      stopCamera();
      dispatch(
        showToast({
          message: 'Realtime athlete profile photo captured successfully!',
          type: 'success',
        })
      );
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
          stopCamera();
          dispatch(
            showToast({
              message: 'Athlete profile photo uploaded successfully!',
              type: 'success',
            })
          );
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStepDuration = (delta: number) => {
    setSelectedDurationMonths((prev) => Math.max(1, Math.min(60, prev + delta)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      dispatch(showToast({ message: 'First and Last name are required', type: 'error' }));
      return;
    }

    if (!phone.trim()) {
      dispatch(showToast({ message: 'Phone number is required', type: 'error' }));
      return;
    }

    try {
      setIsSubmitting(true);

      const clientData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: phone.trim(),
        gender,
        dateOfBirth,
        address: address.trim() || undefined,
        membershipType: selectedPlan?.name || 'Standard Pass',
        startDate,
        emergencyContactName: emergencyContact.trim() || undefined,
        medicalNotes: medicalNotes.trim() || undefined,
        waiverSigned: true,
        rfidTag: `RFID-${Math.floor(100000 + Math.random() * 900000)}`,
      };

      // 1. Dispatch createClient
      const createdClient = await dispatch(addClient(clientData)).unwrap();

      // 2. Synchronize with Gym Slice
      const regId = `ARC-${Math.floor(1000 + Math.random() * 9000)}`;

      const newMember: RegisteredMember = {
        id: createdClient.id || `mem-${Date.now()}`,
        regId,
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        email: clientData.email,
        phone: clientData.phone,
        dob: clientData.dateOfBirth,
        gender: clientData.gender,
        address: clientData.address,
        emergencyContact: clientData.emergencyContactName,
        medicalNotes: clientData.medicalNotes,
        photoUrl: photoUrl || null,
        planId: selectedPlan?.id || 'plan-custom',
        planName: selectedPlan?.name || 'Standard Pass',
        durationMonths: selectedDurationMonths,
        startDate,
        expiryDate: calculatedExpiryDate,
        totalFee: calculatedFee,
        paymentStatus: 'PAID',
        paymentMethod: paymentMethod,
        registeredByStaffId: 'staff-active',
        registeredByStaffName: 'Registration Desk',
        registeredAt: new Date().toISOString(),
        status: 'ACTIVE',
      };

      dispatch(registerMember(newMember));

      setRecentlyRegistered({
        name: `${clientData.firstName} ${clientData.lastName}`,
        regId,
        membershipType: `${selectedPlan?.name || 'Standard'} (${selectedDurationMonths} Mo)`,
      });

      dispatch(
        showToast({
          message: `Athlete ${clientData.firstName} ${clientData.lastName} registered successfully! (ID: ${regId})`,
          type: 'success',
        })
      );

      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setEmergencyContact('');
      setMedicalNotes('');
      setPhotoUrl(null);
      stopCamera();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to register athlete';
      dispatch(showToast({ message: errorMsg, type: 'error' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryBadgeClass = (catStr: string = '') => {
    const lower = catStr.toLowerCase();
    if (lower.includes('under') || lower.includes('youth')) {
      return 'bg-amber-950/60 border-amber-500/40 text-amber-400';
    }
    if (lower.includes('org') || lower.includes('corp')) {
      return 'bg-purple-950/60 border-purple-500/40 text-purple-400';
    }
    return 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400';
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Hidden file input for Photo Upload fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Athlete Registration &amp; Plan Selection
        </h1>
        <p className="text-[11px] font-mono font-bold text-slate-400 tracking-wider uppercase mt-1">
          REGISTER NEW MEMBER &bull; REALTIME CAMERA VERIFICATION &bull; SELECT ADMIN MEMBERSHIP PLAN &bull; INTERACTIVE DURATION TICKER
        </p>
      </div>

      {/* Success Notification Banner */}
      {recentlyRegistered && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                {recentlyRegistered.name} is now registered!
              </div>
              <div className="text-xs text-emerald-400/90 font-mono">
                Assigned ID: {recentlyRegistered.regId} &bull; {recentlyRegistered.membershipType}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch(setActiveTab('check-in-desk'))}
              className="px-3 py-1.5 bg-lime-400 text-black font-extrabold text-xs rounded-lg hover:bg-lime-300 transition cursor-pointer"
            >
              Check-In Now
            </button>
            <button
              type="button"
              onClick={() => setRecentlyRegistered(null)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 font-semibold text-xs rounded-lg hover:bg-slate-700 transition cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Form Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: ATHLETE PERSONAL INFORMATION (6 COLS)                        */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
            {/* Header: 1. ATHLETE PERSONAL INFORMATION */}
            <div className="flex items-center gap-2 text-lime-400 font-extrabold text-xs uppercase tracking-wider font-mono">
              <User className="w-4 h-4" />
              <span>1. ATHLETE PERSONAL INFORMATION</span>
            </div>

            {/* Name Fields (First Name & Last Name) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  FIRST NAME *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Jordan"
                  className="w-full bg-[#070E1C] border border-[#142644] focus:border-lime-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  LAST NAME *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Vance"
                  className="w-full bg-[#070E1C] border border-[#142644] focus:border-lime-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  EMAIL ADDRESS *
                </label>
                <div className="relative flex items-center bg-[#070E1C] border border-[#142644] focus-within:border-lime-400 rounded-xl px-3.5 py-2.5 transition-colors">
                  <Mail className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jordan.vance@example.com"
                    className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  PHONE NUMBER *
                </label>
                <div className="relative flex items-center bg-[#070E1C] border border-[#142644] focus-within:border-lime-400 rounded-xl px-3.5 py-2.5 transition-colors">
                  <Phone className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 234-5678"
                    className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Date of Birth & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  DATE OF BIRTH
                </label>
                <div className="relative flex items-center bg-[#070E1C] border border-[#142644] focus-within:border-lime-400 rounded-xl px-3.5 py-2.5 transition-colors">
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full bg-transparent text-xs text-white outline-none [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  GENDER
                </label>
                <div className="relative">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE' | 'OTHER')}
                    className="w-full bg-[#070E1C] border border-[#142644] focus:border-lime-400 rounded-xl px-4 py-2.5 text-xs text-white outline-none appearance-none pr-9 transition-colors"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                ADDRESS
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Residential Address"
                className="w-full bg-[#070E1C] border border-[#142644] focus:border-lime-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition-colors"
              />
            </div>

            {/* Emergency Contact & Medical Notes */}
            <div className="space-y-3">
              <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                EMERGENCY CONTACT &amp; MEDICAL NOTES
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Emergency Contact Name & Phone"
                className="w-full bg-[#070E1C] border border-[#142644] focus:border-lime-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition-colors"
              />
              <textarea
                rows={3}
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                placeholder="Injuries / Physical Conditions (e.g. Past shoulder surgery, asthma)..."
                className="w-full bg-[#070E1C] border border-[#142644] focus:border-lime-400 rounded-xl p-4 text-xs text-white placeholder:text-slate-600 outline-none resize-none transition-colors"
              />
            </div>

            {/* Athlete Profile Photo Box & Realtime Camera Section */}
            <div className="space-y-3 pt-2 border-t border-[#142644]">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5 text-lime-400" />
                  <span>ATHLETE PROFILE PHOTO</span>
                </div>
                {isCameraActive && (
                  <span className="flex items-center gap-1.5 text-red-400 font-bold text-[10px] animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                    LIVE CAMERA ACTIVE
                  </span>
                )}
              </div>

              {/* Realtime Live Camera Viewfinder (when active) */}
              {isCameraActive ? (
                <div className="bg-[#070E1C] border-2 border-lime-400/80 rounded-2xl p-4 space-y-3 shadow-[0_0_25px_rgba(163,230,53,0.2)]">
                  {cameraError ? (
                    <div className="p-4 bg-red-950/50 border border-red-500/40 rounded-xl space-y-3 text-center">
                      <p className="text-xs text-red-300 font-medium">{cameraError}</p>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-3 py-1.5 bg-lime-400 text-black text-xs font-extrabold rounded-lg hover:bg-lime-300 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Retry Camera</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-700 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Image</span>
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-3 py-1.5 bg-transparent text-slate-400 text-xs font-semibold hover:text-white transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Video Stream Container with Face Target Overlay */}
                      <div className="relative aspect-square max-w-[280px] mx-auto bg-black rounded-xl overflow-hidden border border-[#142644] flex items-center justify-center">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover -scale-x-100"
                        />

                        {/* Circular Face Guide Reticle Overlay */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <div className="w-44 h-44 rounded-full border-2 border-dashed border-lime-400/70 shadow-[0_0_15px_rgba(163,230,53,0.3)] flex items-center justify-center">
                            <span className="text-[9px] font-mono text-lime-300 font-bold bg-black/60 px-2 py-0.5 rounded-full">
                              Center Face
                            </span>
                          </div>
                        </div>

                        {/* Top Live Badge */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/70 px-2 py-0.5 rounded-full border border-red-500/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                          <span className="text-[9px] font-mono font-bold text-white tracking-wider">REC</span>
                        </div>
                      </div>

                      {/* Camera Control Actions */}
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleCaptureSnapshot}
                          className="bg-[#A3E635] hover:bg-[#bef264] active:scale-[0.98] text-black font-black text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(163,230,53,0.35)] transition-all cursor-pointer"
                        >
                          <Camera className="w-4 h-4 stroke-[2.5]" />
                          <span>Capture Realtime Snapshot</span>
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="bg-[#0A1324] hover:bg-[#142644] text-slate-300 font-bold text-xs py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 border border-[#142644] transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Standard Photo Display & Trigger View */
                <div className="bg-[#070E1C] border border-[#142644] rounded-xl p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#0A1324] border border-[#142644] flex flex-col items-center justify-center shrink-0 overflow-hidden relative group">
                    {photoUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photoUrl} alt="Athlete" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <button
                            type="button"
                            onClick={() => setPhotoUrl(null)}
                            title="Remove photo"
                            className="p-1 rounded-lg bg-red-600 text-white hover:bg-red-500 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5 text-slate-500 mb-1" />
                        <span className="text-[9px] font-mono text-slate-500 font-bold">No Photo</span>
                      </>
                    )}
                  </div>

                  <div className="space-y-2 flex-1 min-w-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">Webcam Profile Capture</h4>
                        {photoUrl && (
                          <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.2 rounded">
                            VERIFIED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Connect camera device to take a realtime photo for member profiles &amp; desk verification.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        disabled={isConnectingCamera}
                        className="bg-[#A3E635] hover:bg-[#bef264] active:scale-[0.98] text-black font-extrabold text-[11px] py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 shadow-[0_0_10px_rgba(163,230,53,0.25)] transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{photoUrl ? 'Retake via Camera' : 'Connect Camera & Capture'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[#0A1324] hover:bg-[#142644] text-slate-300 font-semibold text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-1.5 border border-[#142644] transition-colors cursor-pointer"
                        title="Or upload an existing image file"
                      >
                        <Upload className="w-3 h-3 text-slate-400" />
                        <span>Upload File</span>
                      </button>

                      {photoUrl && (
                        <button
                          type="button"
                          onClick={() => setPhotoUrl(null)}
                          className="text-red-400 hover:text-red-300 font-mono text-[10px] px-2 py-1 transition cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: SELECT AVAILABLE MEMBERSHIP PLAN & DURATION (6 COLS)        */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
            {/* Header: 2. SELECT AVAILABLE MEMBERSHIP PLAN */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-lime-400 font-extrabold text-xs uppercase tracking-wider font-mono">
                <Box className="w-4 h-4" />
                <span>2. SELECT AVAILABLE MEMBERSHIP PLAN</span>
              </div>
              <p className="text-xs text-slate-400">
                Choose from admin-configured membership categories and custom packages.
              </p>
            </div>

            {/* Admin-built Plans Inventory List */}
            <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
              {membershipPlans?.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full rounded-xl p-3.5 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#070E1C] border-2 border-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.15)]'
                        : 'bg-[#070E1C] border border-[#142644] hover:border-[#1E3A66]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${getCategoryBadgeClass(
                            plan.category
                          )}`}
                        >
                          {plan.category}
                        </span>
                        <span className="text-xs font-extrabold text-white tracking-tight">
                          {plan.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Default Base: {plan.durationMonths}{' '}
                        {plan.durationMonths === 1 ? 'Month' : 'Months'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-black font-mono text-lime-400">
                        ${plan.price}
                      </span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-lime-400 text-black flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-700" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Section 3: SELECT DURATION (Interactive +1 / -1 Month Ticker) */}
            <div className="space-y-4 pt-3 border-t border-[#142644]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lime-400 font-extrabold text-xs uppercase tracking-wider font-mono">
                  <Clock className="w-4 h-4" />
                  <span>3. SELECT DURATION</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Custom Stepper
                </span>
              </div>

              {/* Prominent Interactive Ticker / Stepper (+1 / -1 Month) */}
              <div className="bg-[#070E1C] border border-[#142644] rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white">Membership Duration</div>
                  <div className="text-[11px] text-slate-400 font-mono">Adjust in 1-month increments</div>
                </div>

                <div className="flex items-center gap-3 bg-[#0A1324] border border-[#1E3A66] rounded-xl p-1.5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => handleStepDuration(-1)}
                    disabled={selectedDurationMonths <= 1}
                    className="w-9 h-9 rounded-lg bg-[#070E1C] hover:bg-[#142644] disabled:opacity-30 disabled:hover:bg-[#070E1C] text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
                    title="Decrease duration by 1 month (-1)"
                  >
                    <Minus className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <div className="px-3 min-w-[5.5rem] text-center">
                    <span className="text-lg font-black font-mono text-lime-400">
                      {selectedDurationMonths}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300 ml-1.5">
                      {selectedDurationMonths === 1 ? 'Month' : 'Months'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStepDuration(1)}
                    disabled={selectedDurationMonths >= 60}
                    className="w-9 h-9 rounded-lg bg-lime-400 hover:bg-lime-300 disabled:opacity-30 text-black flex items-center justify-center transition active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(163,230,53,0.3)]"
                    title="Increase duration by 1 month (+1)"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              {/* Summary / Calculation Box */}
              <div className="bg-[#070E1C] border border-[#142644] rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Selected Plan:</span>
                  <span className="font-extrabold text-white">
                    {selectedPlan?.name || '1 Month - Starter Pass'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Start Date:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-[#0A1324] border border-[#142644] rounded-lg px-2.5 py-1 text-xs text-white font-mono outline-none [color-scheme:dark]"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Expiration Date:</span>
                  <span className="font-mono font-bold text-lime-400">
                    {calculatedExpiryDate || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#142644] text-xs">
                  <span className="text-slate-400 font-medium">
                    Calculated Fee ({selectedDurationMonths} {selectedDurationMonths === 1 ? 'Month' : 'Months'}):
                  </span>
                  <span className="text-base font-black font-mono text-white">
                    ${calculatedFee.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-[#070E1C] border border-[#142644] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span>Payment Status</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-400">
                    Payment Received
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    PAYMENT METHOD
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        paymentMethod === 'CARD'
                          ? 'bg-[#0A1324] border border-lime-400 text-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.15)]'
                          : 'bg-[#0A1324] border border-[#142644] text-slate-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        paymentMethod === 'CASH'
                          ? 'bg-[#0A1324] border border-lime-400 text-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.15)]'
                          : 'bg-[#0A1324] border border-[#142644] text-slate-400 hover:text-white'
                      }`}
                    >
                      <Banknote className="w-3.5 h-3.5" />
                      <span>Cash</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('BANK_TRANSFER')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        paymentMethod === 'BANK_TRANSFER'
                          ? 'bg-[#0A1324] border border-lime-400 text-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.15)]'
                          : 'bg-[#0A1324] border border-[#142644] text-slate-400 hover:text-white'
                      }`}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Transfer</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Big CTA Button: CONFIRM & REGISTER ATHLETE */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#A3E635] hover:bg-[#bef264] disabled:opacity-50 text-black font-extrabold text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(163,230,53,0.35)] transition-all cursor-pointer mt-2"
              >
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                <span>{isSubmitting ? 'Registering Athlete...' : 'CONFIRM & REGISTER ATHLETE'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
