import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

const CandlestickChart = () => {
    const chartContainerRef = useRef();

    useEffect(() => {
        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#060b18' },
                textColor: '#64748b',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.02)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.02)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            timeScale: {
                borderVisible: false,
            },
            rightPriceScale: {
                borderVisible: false,
            },
            crosshair: {
                vertLine: {
                    color: 'rgba(255, 255, 255, 0.2)',
                    labelBackgroundColor: '#1e293b',
                },
                horzLine: {
                    color: 'rgba(255, 255, 255, 0.2)',
                    labelBackgroundColor: '#1e293b',
                },
            },
        });

        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#10b981',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444',
        });

        // Generate some dummy data
        const data = [];
        const now = Math.floor(Date.now() / 1000);
        let basePrice = 65000;

        for (let i = 0; i < 100; i++) {
            const open = basePrice + Math.random() * 100 - 50;
            const close = open + Math.random() * 100 - 50;
            const high = Math.max(open, close) + Math.random() * 20;
            const low = Math.min(open, close) - Math.random() * 20;

            data.push({
                time: now - (100 - i) * 60,
                open,
                high,
                low,
                close
            });
            basePrice = close;
        }

        candlestickSeries.setData(data);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    return <div ref={chartContainerRef} className="w-full h-full" />;
};

export default CandlestickChart;
