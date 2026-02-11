import React, { useEffect, useState } from 'react';

interface DebugLog {
    type: 'log' | 'error' | 'warn';
    message: string;
    timestamp: string;
}

export const DebugOverlay: React.FC = () => {
    const [logs, setLogs] = useState<DebugLog[]>([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Capturar console.log
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args: any[]) => {
            originalLog(...args);
            setLogs(prev => [...prev, {
                type: 'log',
                message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '),
                timestamp: new Date().toLocaleTimeString()
            }]);
        };

        console.error = (...args: any[]) => {
            originalError(...args);
            setLogs(prev => [...prev, {
                type: 'error',
                message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '),
                timestamp: new Date().toLocaleTimeString()
            }]);
        };

        console.warn = (...args: any[]) => {
            originalWarn(...args);
            setLogs(prev => [...prev, {
                type: 'warn',
                message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '),
                timestamp: new Date().toLocaleTimeString()
            }]);
        };

        // Capturar erros não tratados
        const handleError = (event: ErrorEvent) => {
            setLogs(prev => [...prev, {
                type: 'error',
                message: `ERRO NÃO TRATADO: ${event.message} em ${event.filename}:${event.lineno}`,
                timestamp: new Date().toLocaleTimeString()
            }]);
        };

        window.addEventListener('error', handleError);

        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
            window.removeEventListener('error', handleError);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            color: '#00ff00',
            fontFamily: 'monospace',
            fontSize: '11px',
            padding: '10px',
            overflowY: 'auto',
            zIndex: 999999,
            pointerEvents: 'auto'
        }}>
            <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#fff', fontSize: '14px' }}>🐛 DEBUG iOS - Logs em Tempo Real</strong>
                <button
                    onClick={() => setIsVisible(false)}
                    style={{
                        backgroundColor: '#ff0000',
                        color: '#fff',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontSize: '12px'
                    }}
                >
                    Fechar
                </button>
            </div>

            <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#1a1a1a', borderRadius: '4px' }}>
                <div style={{ color: '#fff' }}>📱 User Agent:</div>
                <div style={{ fontSize: '10px', wordBreak: 'break-all' }}>{navigator.userAgent}</div>
            </div>

            <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#1a1a1a', borderRadius: '4px' }}>
                <div style={{ color: '#fff' }}>🌐 URL:</div>
                <div style={{ fontSize: '10px' }}>{window.location.href}</div>
            </div>

            <div style={{ borderTop: '1px solid #333', paddingTop: '10px' }}>
                <strong style={{ color: '#fff' }}>📋 Logs ({logs.length}):</strong>
                {logs.length === 0 && (
                    <div style={{ color: '#666', marginTop: '10px' }}>Nenhum log ainda...</div>
                )}
                {logs.map((log, index) => (
                    <div
                        key={index}
                        style={{
                            marginTop: '8px',
                            padding: '6px',
                            backgroundColor: log.type === 'error' ? '#3a0000' : log.type === 'warn' ? '#3a3a00' : '#0a0a0a',
                            borderLeft: `3px solid ${log.type === 'error' ? '#ff0000' : log.type === 'warn' ? '#ffaa00' : '#00ff00'}`,
                            borderRadius: '2px',
                            fontSize: '10px',
                            wordBreak: 'break-word'
                        }}
                    >
                        <div style={{ color: '#888', fontSize: '9px' }}>{log.timestamp}</div>
                        <div style={{
                            color: log.type === 'error' ? '#ff6666' : log.type === 'warn' ? '#ffcc66' : '#66ff66',
                            marginTop: '2px'
                        }}>
                            {log.message}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
