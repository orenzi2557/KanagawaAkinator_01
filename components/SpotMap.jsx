"use client";

// 1位（または選んだ候補）と近くのスポットを地図に表示する。
// Leaflet は SSR 非対応なので、呼び出し側で dynamic(..., { ssr: false }) を使って読み込む。

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useEffect } from "react";

// 画像ファイルを使わない丸いピン（バンドラーでデフォルトアイコンが壊れる問題を避ける）
function pinIcon(label, main) {
  const color = main ? "#e8743b" : "#0e7c74";
  const size = main ? 34 : 28;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    tooltipAnchor: [0, -size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};color:#fff;
      display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;
      border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)">${label}</div>`,
  });
}

function FitBounds({ points }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");
  useEffect(() => {
    // 遅延読み込み直後はコンテナの大きさが確定していないことがあるため、測り直してから合わせる
    map.invalidateSize();
    map.fitBounds(points, { padding: [40, 40], maxZoom: 15 });
    // points の中身が変わったときだけ合わせ直す
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

/**
 * @param {{ main: object, nearby: { spot: object, distanceKm: number }[] }} props
 */
export default function SpotMap({ main, nearby }) {
  const center = [main.lat, main.lng];
  const points = [center, ...nearby.map((n) => [n.spot.lat, n.spot.lng])];

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      className="h-72 w-full rounded-xl sm:h-80"
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />
      {nearby.map((n) => (
        <Polyline
          key={`line-${n.spot.id}`}
          positions={[center, [n.spot.lat, n.spot.lng]]}
          pathOptions={{ color: "#0e7c74", weight: 2, dashArray: "6 6" }}
        />
      ))}
      <Marker position={center} icon={pinIcon("★", true)}>
        <Tooltip direction="top" permanent>
          {main.name}
        </Tooltip>
      </Marker>
      {nearby.map((n, i) => (
        <Marker key={n.spot.id} position={[n.spot.lat, n.spot.lng]} icon={pinIcon(i + 1, false)}>
          <Tooltip direction="top">
            {n.spot.name}（約 {n.distanceKm.toFixed(1)} km）
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
