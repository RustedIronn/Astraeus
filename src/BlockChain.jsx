import { ethers } from "ethers";
import { useState } from "react";

export default function BlockChain() {
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);

  const contractAddr = "0x500b4351b96b3cAce599E93842EE0248e1FF2Cee"; // AstraeusCoin address
  const abi = [
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function balanceOf(address) view returns (uint256)"
  ];

  async function sendAstraeusCoin() {
    if (!window.ethereum) return alert("MetaMask not detected!");
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddr, abi, signer);

      const recipient = await signer.getAddress(); // sends to yourself
      setLoading(true);

      const tx = await contract.transfer(recipient, 1000);
      setHash(tx.hash);
      console.log("Transaction sent:", tx.hash);

      await tx.wait();
      alert("✅ Transaction confirmed on Polygon Amoy!");
    } catch (err) {
      console.error(err);
      alert("❌ Transaction failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.07)", // glass base
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "16px",
        padding: "16px",
        width: "185px",
        maxHeight: "200px",
        color: "#e5e7eb",
        fontSize: "0.9rem",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        backdropFilter: "blur(12px) saturate(140%)",
        WebkitBackdropFilter: "blur(12px) saturate(140%)",
        textAlign: "center",
      }}
    >
      <h3 style={{ marginBottom: "10px", color: "#c084fc" }}>Blockchain Int. (Coin)</h3>

      <button
        onClick={sendAstraeusCoin}
        disabled={loading}
        style={{
          background: "#885ed4ff",
          color: "white",
          borderRadius: "10px",
          padding: "10px 20px",
          fontWeight: "bold",
          cursor: "pointer",
          border: "none",
          transition: "all 0.3s ease",
        }}
      >
        {loading ? "Processing..." : "Hash 1k AstraeusCoins"}
      </button>

      {hash && (
        <p style={{ marginTop: "12px", fontSize: "0.8rem" }}>
          ✅ TX:{" "}
          <a
            href={`https://amoy.polygonscan.com/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#00eaff", textDecoration: "underline" }}
          >
            {hash.slice(0, 10)}...
          </a>
        </p>
      )}
    </div>
  );
}
