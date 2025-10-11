export default function LoadingOverlay() {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: "white",
        background: "rgba(0, 0, 0, 0.7)",
        padding: "14px 24px",
        borderRadius: "10px",
        fontSize: "1rem",
        zIndex: 999,
        boxShadow: "0 0 20px rgba(168,85,247,0.4)",
        textAlign: "center",
      }}
    >
      🚀 Loading stars from AWS API...
    </div>
  );
}
