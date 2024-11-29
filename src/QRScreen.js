import React from "react";
import QRScanner from "./QRScanner";

const QRScreen = ({ onScanSuccess }) => {
  return <QRScanner onScanSuccess={onScanSuccess} />;
};

export default QRScreen;
