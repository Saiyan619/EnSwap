const BackgroundGlow = () => {
    return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Primary amber glow */}
      <div
        className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.08) 40%, transparent 70%)",
          filter: "blur(80px)",
          animation: "pulse 10s ease-in-out infinite",
        }}
      />
      {/* Coral/orange accent */}
      <div
        className="absolute bottom-[15%] right-[5%] w-[500px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(234, 88, 12, 0.12) 0%, transparent 60%)",
          filter: "blur(70px)",
          animation: "pulse 12s ease-in-out infinite reverse",
        }}
      />
      {/* Warm bronze accent left */}
      <div
        className="absolute top-[50%] left-[0%] w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(180, 83, 9, 0.1) 0%, transparent 60%)",
          filter: "blur(60px)",
          animation: "pulse 14s ease-in-out infinite",
        }}
      />
    </div>
  )
  
}

export default BackgroundGlow
