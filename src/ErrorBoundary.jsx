import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
    this.state.scale = Math.min(window.innerWidth / 1920, 1);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error, info) {
    console.error("Canvas crashed:", error, info);
  }

  componentDidMount() {
    this.handleResize = () => {
      this.setState({ scale: Math.min(window.innerWidth / 1920, 1) });
    };
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "#0b0b0f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontFamily: "monospace",
            zIndex: 9999,
            transform: `scale(${this.state.scale})`,
            transformOrigin: "center center",
            transition: "transform 0.2s ease-out",
          }}
        >
          ⚠️ WebGL Error: {this.state.message}
        </div>
      );
    }
    return this.props.children;
  }
}
