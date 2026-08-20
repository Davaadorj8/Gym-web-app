'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { showToast, setActiveTab } from '@/features/ui/uiSlice';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  HeartPulse,
  Camera,
  Check,
  ShieldCheck,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  RefreshCw,
  Sparkles,
  Upload,
  AlertCircle,
  X,
  Zap,
} from 'lucide-react';

interface PlanOption {
  id: string;
  name: string;
  category: 'Over 18' | 'Youth' | 'Classes';
  basePrice: number;
  baseDurationMonths: number;
  description: string;
}

const AVAILABLE_PLANS: PlanOption[] = [
  {
    id: 'starter-1m',
    name: '1 Month - Starter Pass',
    category: 'Over 18',
    basePrice: 110,
    baseDurationMonths: 1,
    description: 'Default Base: 1 Month',
  },
  {
    id: 'pro-3m',
    name: '3 Months - Pro Athlete',
    category: 'Over 18',
    basePrice: 299,
    baseDurationMonths: 3,
    description: 'Default Base: 3 Months',
  },
  {
    id: 'semi-6m',
    name: '6 Months - Semi-Annual',
    category: 'Over 18',
    basePrice: 550,
    baseDurationMonths: 6,
    description: 'Default Base: 6 Months',
  },
  {
    id: 'elite-12m',
    name: '1 Year - Elite Unlimited',
    category: 'Over 18',
    basePrice: 999,
    baseDurationMonths: 12,
    description: 'Default Base: 12 Months',
  },
  {
    id: 'youth-1m',
    name: 'Under 18 Youth Pass',
    category: 'Youth',
    basePrice: 85,
    baseDurationMonths: 1,
    description: 'Default Base: 1 Month (Guardian Waiver)',
  },
  {
    id: 'aerobics-2m',
    name: 'Aerobics & Group Pass',
    category: 'Classes',
    basePrice: 180,
    baseDurationMonths: 2,
    description: 'Default Base: 2 Months Unlimited Classes',
  },
];

export default function AthleteRegistrationView() {
  const dispatch = useAppDispatch();

  // Section 1: Personal Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('1998-04-12');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');

  // Section 2: Webcam / Profile Photo
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Section 3: Plan Selection
  const [selectedPlanId, setSelectedPlanId] = useState<string>('starter-1m');

  // Section 4: Duration Selection
  const [selectedDuration, setSelectedDuration] = useState<number>(1);

  // Section 5: Payment Status & Method
  const [paymentStatus, setPaymentStatus] = useState<'Received' | 'Pending'>('Received');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Cash' | 'Transfer'>('Card');

  const selectedPlan = AVAILABLE_PLANS.find((p) => p.id === selectedPlanId) || AVAILABLE_PLANS[0];

  // Calculate Dates and Fee
  const startDate = new Date();
  const expirationDate = new Date();
  expirationDate.setMonth(expirationDate.getMonth() + selectedDuration);

  const formatDate = (d: Date) => {
    return d.toISOString().split('T')[0];
  };

  const calculatedFee = (
    (selectedPlan.basePrice / selectedPlan.baseDurationMonths) *
    selectedDuration
  ).toFixed(2);

  // Start Camera Stream
  const handleStartCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });
        mediaStreamRef.current = stream;
        setIsCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } else {
        setCameraError('Camera API is not supported in this environment.');
      }
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      setCameraError('Camera access denied or unavailable. You may upload a photo file instead.');
    }
  };

  // Stop Camera Stream
  const handleStopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture Photo Snapshot
  const handleCapturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 400;
      canvas.height = videoRef.current.videoHeight || 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPhotoUrl(dataUrl);
        handleStopCamera();
        dispatch(showToast({ message: 'Athlete photo captured successfully!', type: 'success' }));
      }
    }
  };

  // Handle File Upload Fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUrl(reader.result as string);
        dispatch(showToast({ message: 'Profile photo uploaded!', type: 'success' }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Cleanup camera when unmounting
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // When plan changes, set initial duration to match base duration
  const handleSelectPlan = (plan: PlanOption) => {
    setSelectedPlanId(plan.id);
    setSelectedDuration(plan.baseDurationMonths);
  };

  // Handle Form Submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      dispatch(showToast({ message: 'Please enter both First Name and Last Name.', type: 'error' }));
      return;
    }

    if (!email.trim()) {
      dispatch(showToast({ message: 'Please enter an Email Address.', type: 'error' }));
      return;
    }

    const regId = `ARC-${Math.floor(1000 + Math.random() * 9000)}`;

    // Dispatch toast and notification
    dispatch(
      showToast({
        message: `Registered ${firstName} ${lastName} (${regId}) with ${selectedPlan.name}!`,
        type: 'success',
      })
    );

    // Reset fields
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setEmergencyContact('');
    setMedicalNotes('');
    setPhotoUrl(null);
    handleStopCamera();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Title Banner matching Image 2 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Athlete Registration &amp; Plan Selection
        </h1>
        <p className="text-[11px] sm:text-xs font-mono font-bold text-slate-400 tracking-wider uppercase mt-1">
          REGISTER NEW MEMBER &bull; SELECT ADMIN MEMBERSHIP PLAN &bull; SET CUSTOM DURATION &bull; CONFIRM PAYMENT
        </p>
      </div>

      <form onSubmit={handleRegisterSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Section 1 (Personal Info) & Section 2 (Webcam Capture)       */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. ATHLETE PERSONAL INFORMATION */}
            <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-5 sm:p-6 space-y-5 shadow-lg">
              <div className="flex items-center gap-2 text-lime-400 font-extrabold text-xs sm:text-sm tracking-wider uppercase">
                <User className="w-4 h-4 text-lime-400" />
                <span>1. Athlete Personal Information</span>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
                    FIRST NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Jordan"
                    className="w-full px-3.5 py-2.5 bg-[#070E1C] border border-[#142644] rounded-xl text-white text-xs font-medium focus:outline-none focus:border-lime-400 placeholder:text-slate-600 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
                    LAST NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Vance"
                    className="w-full px-3.5 py-2.5 bg-[#070E1C] border border-[#142644] rounded-xl text-white text-xs font-medium focus:outline-none focus:border-lime-400 placeholder:text-slate-600 transition-colors"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
                    EMAIL ADDRESS *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jordan.vance@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#070E1C] border border-[#142644] rounded-xl text-white text-xs font-medium focus:outline-none focus:border-lime-400 placeholder:text-slate-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
                    PHONE NUMBER *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 234-5678"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#070E1C] border border-[#142644] rounded-xl text-white text-xs font-medium focus:outline-none focus:border-lime-400 placeholder:text-slate-600 transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Date of Birth & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
                    DATE OF BIRTH
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#070E1C] border border-[#142644] rounded-xl text-white text-xs font-medium focus:outline-none focus:border-lime-400 transition-colors [color-scheme:dark]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
                    GENDER
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#070E1C] border border-[#142644] rounded-xl text-white text-xs font-medium focus:outline-none focus:border-lime-400 transition-colors cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
                  ADDRESS
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Residential Address"
                  className="w-full px-3.5 py-2.5 bg-[#070E1C] border border-[#142644] rounded-xl text-white text-xs font-medium focus:outline-none focus:border-lime-400 placeholder:text-slate-600 transition-colors"
                />
              </div>

              {/* Emergency Contact & Medical Notes */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
                    EMERGENCY CONTACT &amp; MEDICAL NOTES
                  </label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="Emergency Contact Name & Phone"
                    className="w-full px-3.5 py-2.5 bg-[#070E1C] border border-[#142644] rounded-xl text-white text-xs font-medium focus:outline-none focus:border-lime-400 placeholder:text-slate-600 transition-colors"
                  />
                </div>

                <textarea
                  rows={2}
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="Injuries / Physical Conditions (e.g. Past shoulder surgery, asthma)..."
                  className="w-full px-3.5 py-2.5 bg-[#070E1C] border border-[#142644] rounded-xl text-white text-xs font-medium focus:outline-none focus:border-lime-400 placeholder:text-slate-600 transition-colors resize-none"
                />
              </div>
            </div>

            {/* SECTION 2: WEBCAM PROFILE CAPTURE */}
            <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 text-lime-400 font-extrabold text-xs sm:text-sm tracking-wider uppercase">
                <Camera className="w-4 h-4 text-lime-400" />
                <span>Athlete Profile Photo</span>
              </div>

              <div className="bg-[#070E1C] border border-[#142644] rounded-xl p-4 flex flex-col sm:flex-row items-center gap-5">
                {/* Photo or Live Video Display Frame */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-[#0A1324] border-2 border-dashed border-[#1E3A66] overflow-hidden flex items-center justify-center shrink-0">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoUrl}
                      alt="Athlete Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : isCameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover mirror"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 p-2 text-center">
                      <Camera className="w-8 h-8 mb-1 opacity-60" />
                      <span className="text-[10px] font-semibold text-slate-500">No Photo</span>
                    </div>
                  )}

                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl(null)}
                      className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-500 text-white rounded-full text-xs shadow-md transition-colors"
                      title="Remove Photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Webcam Controls & Actions */}
                <div className="flex-1 space-y-2.5 text-center sm:text-left">
                  <div>
                    <h4 className="text-xs font-bold text-white">Webcam Profile Capture</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Take a live webcam shot for front-desk athlete visual verification.
                    </p>
                  </div>

                  {cameraError && (
                    <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-[11px] text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{cameraError}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                    {!isCameraActive ? (
                      <button
                        type="button"
                        onClick={handleStartCamera}
                        className="py-2 px-3.5 bg-lime-400 hover:bg-lime-300 active:scale-95 text-black font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-[0_0_12px_rgba(163,230,53,0.3)] transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4 stroke-[2.5]" />
                        <span>Take Photo</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleCapturePhoto}
                          className="py-2 px-3.5 bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-[0_0_12px_rgba(163,230,53,0.3)] transition-all cursor-pointer animate-pulse"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Snap Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleStopCamera}
                          className="py-2 px-3 bg-[#0E1E38] hover:bg-[#152B4E] text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2 px-3 bg-[#0E1E38] hover:bg-[#152B4E] border border-[#18315B] text-slate-300 hover:text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Section 3 (Plans), Section 4 (Duration), Section 5 (Payment) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* SECTION 3: SELECT AVAILABLE MEMBERSHIP PLAN */}
            <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
              <div>
                <div className="flex items-center gap-2 text-lime-400 font-extrabold text-xs sm:text-sm tracking-wider uppercase">
                  <Zap className="w-4 h-4 text-lime-400" />
                  <span>2. Select Available Membership Plan</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Choose from admin-configured membership categories and custom packages.
                </p>
              </div>

              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {AVAILABLE_PLANS.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => handleSelectPlan(plan)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#0E1E38] border-lime-400/80 shadow-[0_0_12px_rgba(163,230,53,0.15)] ring-1 ring-lime-400/50'
                          : 'bg-[#070E1C] border-[#142644] hover:border-[#1E3A66] hover:bg-[#0A1529]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#0A1324] border border-[#1A335C] text-emerald-400 uppercase">
                            {plan.category}
                          </span>
                          <h4 className="text-xs font-extrabold text-white">{plan.name}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400">{plan.description}</p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-sm font-black text-lime-400 font-mono">
                          ${plan.basePrice}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-lime-400 text-black shadow-[0_0_8px_rgba(163,230,53,0.4)]'
                              : 'border border-[#1E3A66] bg-transparent'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 4: SELECT DURATION */}
            <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 text-lime-400 font-extrabold text-xs sm:text-sm tracking-wider uppercase">
                <Calendar className="w-4 h-4 text-lime-400" />
                <span>3. Select Duration</span>
              </div>

              {/* Duration Pills */}
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { label: '1 Mo', val: 1 },
                  { label: '2 Mo', val: 2 },
                  { label: '3 Mo', val: 3 },
                  { label: '6 Mo', val: 6 },
                  { label: '12 Mo', val: 12 },
                ].map((item) => {
                  const isSelected = selectedDuration === item.val;
                  return (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setSelectedDuration(item.val)}
                      className={`py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-lime-400 text-black shadow-[0_0_10px_rgba(163,230,53,0.3)]'
                          : 'bg-[#070E1C] border border-[#142644] text-slate-300 hover:text-white hover:border-[#1E3A66]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Calculated Summary Table */}
              <div className="p-3.5 bg-[#070E1C] border border-[#142644] rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-[11px] text-slate-400">Selected Plan:</span>
                  <span className="font-bold text-white">{selectedPlan.name}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-[11px] text-slate-400">Start Date:</span>
                  <span className="font-mono text-slate-300">{formatDate(startDate)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-[11px] text-slate-400">Expiration Date:</span>
                  <span className="font-mono font-bold text-lime-400">
                    {formatDate(expirationDate)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#142644] flex items-center justify-between text-white">
                  <span className="text-xs font-bold">
                    Calculated Fee ({selectedDuration} Mo):
                  </span>
                  <span className="text-base font-black text-lime-400 font-mono">
                    ${calculatedFee}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 5: PAYMENT STATUS & METHOD */}
            <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-lime-400" />
                  <span className="text-xs font-extrabold text-white tracking-wide">
                    Payment Status
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-[#070E1C] p-1 rounded-xl border border-[#142644]">
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('Received')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paymentStatus === 'Received'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Payment Received
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('Pending')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paymentStatus === 'Pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Pending
                  </button>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
                  PAYMENT METHOD
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Card', 'Cash', 'Transfer'] as const).map((method) => {
                    const isSelected = paymentMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#0E1E38] border-lime-400 text-lime-400 shadow-xs'
                            : 'bg-[#070E1C] border-[#142644] text-slate-400 hover:text-white'
                        }`}
                      >
                        {method === 'Card' && <CreditCard className="w-3.5 h-3.5" />}
                        {method === 'Cash' && <Banknote className="w-3.5 h-3.5" />}
                        {method === 'Transfer' && <ArrowRightLeft className="w-3.5 h-3.5" />}
                        <span>{method}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CONFIRMATION & REGISTRATION BUTTON */}
            <button
              type="submit"
              className="w-full py-4 px-6 bg-lime-400 hover:bg-lime-300 active:scale-[0.99] text-black font-black text-sm tracking-wider uppercase rounded-2xl flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(163,230,53,0.4)] transition-all cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              <span>Confirm &amp; Register Athlete</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
