"""
Slow Connection Network Performance Benchmark for Velarion Markets.
Simulates realistic mobile and throttled network conditions (Slow 3G, Regular 4G, High Latency)
and validates TTFB, wire compression, caching headers, and asset transfer speeds.
"""

import urllib.request
import time
import io
import gzip

ENDPOINTS = [
    {"name": "Landing Page (HTML)", "path": "/", "type": "html"},
    {"name": "Brand Dark WebP (Logo)", "path": "/velarion_brand_dark.webp", "type": "image"},
    {"name": "Brand Emblem WebP", "path": "/velarion_emblem_dark.webp", "type": "image"},
    {"name": "Favicon ICO", "path": "/favicon.ico", "type": "icon"},
    {"name": "Forex Curriculum JS", "path": "/forex_curriculum.js", "type": "js"},
    {"name": "Status API (JSON)", "path": "/api/status", "type": "api"},
]

PROFILES = {
    "Broadband / Local": {"latency_ms": 5, "kbps": 50000},
    "Fast 4G / LTE": {"latency_ms": 70, "kbps": 10000},
    "Slow 3G (Throttled Mobile)": {"latency_ms": 400, "kbps": 400},
}

BASE_URL = "http://127.0.0.1:8000"


def benchmark_endpoint(ep, profile_name, profile):
    url = BASE_URL + ep["path"]
    req = urllib.request.Request(url, headers={"Accept-Encoding": "gzip"})
    
    t0 = time.time()
    try:
        with urllib.request.urlopen(req) as resp:
            ttfb = (time.time() - t0) * 1000
            content = resp.read()
            raw_len = len(content)
            encoding = resp.headers.get("Content-Encoding", "identity")
            cache_control = resp.headers.get("Cache-Control", "none")
            content_type = resp.headers.get("Content-Type", "")

            # If gzipped, compute uncompressed size for comparison
            uncompressed_size = raw_len
            if encoding == "gzip":
                try:
                    uncompressed_size = len(gzip.decompress(content))
                except Exception:
                    pass

            # Calculate simulated transfer time under network profile
            # Time = RTT (latency) + (size in bits / bandwidth in bps)
            latency_sec = profile["latency_ms"] / 1000.0
            bandwidth_bps = profile["kbps"] * 1024
            simulated_transfer_sec = latency_sec + ((raw_len * 8) / bandwidth_bps)

            return {
                "name": ep["name"],
                "path": ep["path"],
                "status": resp.status,
                "wire_bytes": raw_len,
                "uncompressed_bytes": uncompressed_size,
                "compression_ratio": f"{((1 - raw_len / max(uncompressed_size, 1)) * 100):.1f}%" if encoding == "gzip" else "N/A",
                "encoding": encoding,
                "cache_control": cache_control,
                "ttfb_ms": round(ttfb, 1),
                "simulated_time_sec": round(simulated_transfer_sec, 2),
            }
    except Exception as e:
        return {"name": ep["name"], "error": str(e)}


def main():
    print("=" * 80)
    print("VELARION MARKETS - SLOW CONNECTION & PRODUCTION NETWORK AUDIT")
    print("=" * 80)

    for prof_name, prof in PROFILES.items():
        print(f"\n[NETWORK PROFILE: {prof_name}] (Latency: {prof['latency_ms']}ms, Speed: {prof['kbps']} kbps)")
        print("-" * 80)
        print(f"{'Endpoint':<28} {'Wire Size':<12} {'Raw Size':<12} {'Gzip':<8} {'Sim. Time':<10} {'Cache-Control'}")
        print("-" * 80)
        
        total_wire = 0
        total_time = 0.0

        for ep in ENDPOINTS:
            res = benchmark_endpoint(ep, prof_name, prof)
            if "error" in res:
                print(f"{res['name']:<28} ERROR: {res['error']}")
                continue

            total_wire += res["wire_bytes"]
            total_time += res["simulated_time_sec"]

            wire_str = f"{res['wire_bytes'] / 1024:.1f} KB"
            raw_str = f"{res['uncompressed_bytes'] / 1024:.1f} KB"
            cc_short = res['cache_control'][:28]

            print(f"{res['name']:<28} {wire_str:<12} {raw_str:<12} {res['compression_ratio']:<8} {res['simulated_time_sec']:.2f}s{'':<4} {cc_short}")

        print("-" * 80)
        print(f"Total Transferred: {total_wire / 1024:.1f} KB | Total Est. Page Load on {prof_name}: {total_time:.2f}s")


if __name__ == "__main__":
    main()
