import React, { useRef, useState } from "react";
const LiveCamera = ({ onCapture }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const startCamera = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setIsCameraOn(true);
        }
    };
    const stopCamera = () => {
        const stream = videoRef.current?.srcObject;
        stream?.getTracks().forEach(track => track.stop());
        setIsCameraOn(false);
    };
    const captureFrame = () => {
        if (!videoRef.current || !canvasRef.current)
            return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx?.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg");
        onCapture([
            {
                dataUrl,
                timestamp: "0"
            }
        ]);
        stopCamera(); // 🔥 auto stop after capture (clean UX)
    };
    return (<div className="glass-card p-4 rounded-2xl border border-white/10 space-y-4">

      {/* CAMERA VIEW */}
      <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
        {!isCameraOn && (<div className="text-center opacity-40 text-xs uppercase tracking-widest">
            Camera Ready
          </div>)}

        <video ref={videoRef} className={`w-full h-full object-cover ${!isCameraOn ? "hidden" : ""}`}/>
      </div>

      {/* CONTROLS */}
      <div className="flex gap-3">
        {!isCameraOn ? (<button onClick={startCamera} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest 
            border border-violet-500/30 text-violet-400 rounded-lg 
            hover:bg-violet-500/10 transition-all">
            Start Camera
          </button>) : (<>
            <button onClick={captureFrame} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest 
              border border-emerald-500/40 text-emerald-400 rounded-lg 
              hover:bg-emerald-500/10 transition-all">
              Capture & Analyze
            </button>

            <button onClick={stopCamera} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest 
              border border-red-500/40 text-red-500 rounded-lg 
              hover:bg-red-500/10 transition-all">
              Cancel
            </button>
          </>)}
      </div>

      <canvas ref={canvasRef} className="hidden"/>
    </div>);
};
export default LiveCamera;
