// src/components/Mapa.jsx
import React, { useEffect, useMemo } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { normalizarArray } from "../hooks/useMapaRecomendaciones";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiYWxlOTUxMDE5IiwiYSI6ImNtbDFhOXFkeTA2M2kzZXB0ZXRvanRzaGYifQ.u732kFuNU02xTJs9d43Jbg";

const MAP_STYLE = "mapbox://styles/ale951019/cml19r38j00c401s3fqd4hft0";

const DEFAULT_CENTER = {
  latitude: 19.432608,
  longitude: -99.133209,
};

function limpiarTexto(val) {
  return normalizarArray(val).join(", ");
}

export default function Mapa({ empresas = [], center, zoom = 5 }) {
  const initialViewState = useMemo(() => {
    if (center?.length === 2) {
      return { latitude: center[0], longitude: center[1], zoom };
    }

    if (empresas.length > 0) {
      return {
        latitude: Number(empresas[0].lat),
        longitude: Number(empresas[0].lng),
        zoom,
      };
    }

    return { ...DEFAULT_CENTER, zoom };
  }, [center, empresas, zoom]);

  useEffect(() => {
    console.log("Mapbox GL cargado correctamente");
  }, []);

  return (
    <div
      className="w-full max-w-full rounded-xl shadow-lg border border-gray-200 overflow-hidden relative"
      style={{ height: "500px", contain: "strict" }}
    >
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={initialViewState}
        mapStyle={MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
      >
        {empresas.length > 0 ? (
          empresas.map((e) => {
            const lat = Number(e.lat);
            const lng = Number(e.lng);

            const productosTexto = limpiarTexto(e.productos);
            const serviciosTexto = limpiarTexto(e.servicios);

            return (
              <React.Fragment key={e.id}>
                {/* Marker */}
                <Marker latitude={lat} longitude={lng} anchor="bottom">
                  <img
                    src="/custom-marker.png"
                    alt="marker"
                    style={{ width: 40, height: 40 }}
                  />
                </Marker>

                {/* Popup */}
                <Popup
                  latitude={lat}
                  longitude={lng}
                  closeButton={false}
                  closeOnClick={false}
                  offset={25}
                  anchor="top"
                  className="ecosysval-popup"
                >
                  <div
                    style={{
                      color: "#0f172a",
                      fontSize: "13px",
                      lineHeight: "1.25rem",
                      fontWeight: 500,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      {e.nombre}
                    </div>

                    <div style={{ color: "#334155" }}>
                      <b>Tipo:</b> {e.tipo}
                    </div>

                    <div style={{ color: "#334155" }}>
                      <b>Productos:</b> {productosTexto || "No especificado"}
                    </div>

                    {serviciosTexto && serviciosTexto !== "No especificado" && (
                      <div style={{ color: "#334155" }}>
                        <b>Servicios:</b> {serviciosTexto}
                      </div>
                    )}

                    <div style={{ color: "#475569" }}>
                      📍 {e.ciudad}, {e.estado}
                    </div>
                  </div>
                </Popup>
              </React.Fragment>
            );
          })
        ) : (
          <Marker
            latitude={DEFAULT_CENTER.latitude}
            longitude={DEFAULT_CENTER.longitude}
            anchor="bottom"
          >
            <img
              src="/custom-marker.png"
              alt="marker"
              style={{ width: 40, height: 40 }}
            />
          </Marker>
        )}
      </Map>
    </div>
  );
}