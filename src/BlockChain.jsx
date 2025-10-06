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
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <h2>Blockchain Int. (Coin)</h2>

      <button
        onClick={sendAstraeusCoin}
        disabled={loading}
        style={{
          background: "#885ed4ff",
          color: "white",
          borderRadius: "10px",
          padding: "12px 25px",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        {loading ? "Processing..." : "Hash 1k AstraeusCoins"}
      </button>

      {hash && (
        <p style={{ marginTop: "20px" }}>
          ✅ Transaction Hash:{" "}
          <a
            href={`https://amoy.polygonscan.com/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#00eaff", textDecoration: "underline" }}
          >
            {hash.slice(0, 12)}...
          </a>
        </p>
      )}
    </div>
  );
}
