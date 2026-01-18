import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Ship, ArrowRight, ArrowLeft } from 'lucide-react';

function App() {
  const [upperLevel, setUpperLevel] = useState(26);
  const [chamberLevel, setChamberLevel] = useState(10);
  const [lowerLevel, setLowerLevel] = useState(10);
  const [upperValve, setUpperValve] = useState(0);
  const [lowerValve, setLowerValve] = useState(0);
  const [upperGate, setUpperGate] = useState(true);
  const [lowerGate, setLowerGate] = useState(true);
  const [shipPosition, setShipPosition] = useState('upper');
  const [shipDisplacement, setShipDisplacement] = useState(70000);
  const [shipArea, setShipArea] = useState(6000);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [timeScale, setTimeScale] = useState(10);

  const animationRef = useRef(null);
  const lastTimeRef = useRef(Date.now());

  const WATER_DENSITY = 1000;
  const GRAVITY = 9.81;
  const GATE_AREA = 50;
  const CHAMBER_AREA = 33500;
  const CHAMBER_HEIGHT = 30;
  const VALVE_MAX_FLOW = 100;

  const getShipWaterLevelRise = (position) => {
    if (position !== 'chamber') return 0;
    const effectiveArea = CHAMBER_AREA - shipArea;
    return shipDisplacement / effectiveArea;
  };

  const getEffectiveChamberArea = () => {
    return shipPosition === 'chamber' ? CHAMBER_AREA - shipArea : CHAMBER_AREA;
  };

  const getActualChamberLevel = () => {
    return chamberLevel + getShipWaterLevelRise(shipPosition);
  };

  const calculateGateForce = (waterLevel1, waterLevel2) => {
    const heightDiff = Math.abs(waterLevel1 - waterLevel2);
    const avgDepth = heightDiff / 2;
    const pressure = WATER_DENSITY * GRAVITY * avgDepth / 1000;
    const force = pressure * GATE_AREA * 1000 / 1000;
    return { pressure, force };
  };

  const moveShip = (direction) => {
    if (direction === 'toChamber' && shipPosition === 'upper' && !upperGate) {
      const rise = shipDisplacement / (CHAMBER_AREA - shipArea);
      setChamberLevel(prev => Math.max(0, prev - rise));
      setShipPosition('chamber');
    } else if (direction === 'toLower' && shipPosition === 'chamber' && !lowerGate) {
      const rise = shipDisplacement / (CHAMBER_AREA - shipArea);
      setChamberLevel(prev => prev + rise);
      setShipPosition('lower');
    } else if (direction === 'toChamber' && shipPosition === 'lower' && !lowerGate) {
      const rise = shipDisplacement / (CHAMBER_AREA - shipArea);
      setChamberLevel(prev => Math.max(0, prev - rise));
      setShipPosition('chamber');
    } else if (direction === 'toUpper' && shipPosition === 'chamber' && !upperGate) {
      const rise = shipDisplacement / (CHAMBER_AREA - shipArea);
      setChamberLevel(prev => prev + rise);
      setShipPosition('upper');
    }
  };

  useEffect(() => {
    if (!isRunning) return;

    const simulate = () => {
      const now = Date.now();
      const dt = ((now - lastTimeRef.current) / 1000) * timeScale;
      lastTimeRef.current = now;

      setTime(t => t + dt);

      setChamberLevel(prevChamberLevel => {
        const effectiveArea = shipPosition === 'chamber' ? CHAMBER_AREA - shipArea : CHAMBER_AREA;
        const shipRise = shipPosition === 'chamber' ? shipDisplacement / effectiveArea : 0;
        const actualLevel = prevChamberLevel + shipRise;

        let newChamberLevel = prevChamberLevel;

        if (upperValve > 0 && actualLevel < upperLevel) {
          const flowRate = (upperValve / 100) * VALVE_MAX_FLOW;
          const volumeChange = flowRate * dt;
          const levelChange = volumeChange / effectiveArea;
          const maxChange = upperLevel - actualLevel;
          const actualChange = Math.min(levelChange, maxChange);
          newChamberLevel += actualChange;
        }

        if (lowerValve > 0 && actualLevel > lowerLevel) {
          const flowRate = (lowerValve / 100) * VALVE_MAX_FLOW;
          const volumeChange = flowRate * dt;
          const levelChange = volumeChange / effectiveArea;
          const maxChange = actualLevel - lowerLevel;
          const actualChange = Math.min(levelChange, maxChange);
          newChamberLevel -= actualChange;
        }

        return newChamberLevel;
      });

      animationRef.current = requestAnimationFrame(simulate);
    };

    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, upperValve, lowerValve, shipPosition, shipDisplacement, shipArea, timeScale, upperLevel, lowerLevel]);

  const reset = () => {
    setIsRunning(false);
    setUpperLevel(26);
    setChamberLevel(10);
    setLowerLevel(10);
    setUpperValve(0);
    setLowerValve(0);
    setUpperGate(true);
    setLowerGate(true);
    setShipPosition('upper');
    setTime(0);
    setTimeScale(10);
    lastTimeRef.current = Date.now();
  };

  const actualChamberLevel = getActualChamberLevel();
  const upperGateForce = calculateGateForce(upperLevel, actualChamberLevel);
  const lowerGateForce = calculateGateForce(actualChamberLevel, lowerLevel);
  const scale = (level) => (level / CHAMBER_HEIGHT) * 100;

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-sky-200 to-sky-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">パナマ運河閘門シミュレーター</h1>
        <p className="text-gray-600 mb-6">バルブ・ゲート・船を操作して、水位変化とゲートへの圧力を確認できます</p>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => {
                setIsRunning(!isRunning);
                if (!isRunning) lastTimeRef.current = Date.now();
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
              {isRunning ? '一時停止' : '開始'}
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <RotateCcw size={20} />
              リセット
            </button>
            <div className="ml-auto text-lg font-mono bg-gray-100 px-4 py-3 rounded-lg">
              時間: {time.toFixed(1)}秒 (×{timeScale})
            </div>
          </div>

          {/* Time Scale */}
          <div className="mb-4 bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              シミュレーション速度: ×{timeScale} （現実の{timeScale}倍速）
            </label>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={timeScale}
              onChange={(e) => setTimeScale(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>×1 (リアルタイム)</span>
              <span>×10</span>
              <span>×50</span>
              <span>×100</span>
            </div>
          </div>

          {/* Valves and Gates */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                上部バルブ開度: {upperValve}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={upperValve}
                onChange={(e) => setUpperValve(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                下部バルブ開度: {lowerValve}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={lowerValve}
                onChange={(e) => setLowerValve(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">上部ゲート</label>
              <button
                onClick={() => setUpperGate(!upperGate)}
                className={`w-full px-4 py-2 rounded-lg font-semibold transition ${
                  upperGate
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {upperGate ? '閉鎖中' : '開放中'}
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">下部ゲート</label>
              <button
                onClick={() => setLowerGate(!lowerGate)}
                className={`w-full px-4 py-2 rounded-lg font-semibold transition ${
                  lowerGate
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {lowerGate ? '閉鎖中' : '開放中'}
              </button>
            </div>
          </div>
        </div>

        {/* Ship Controls - 続く */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Ship size={24} />
            船の設定と操作
          </h2>

          <div className="grid grid-cols-2 gap-6 mb-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                実質的排水量（貨物等を加味）: {shipDisplacement.toLocaleString()} m³
              </label>
              <input
                type="range"
                min="30000"
                max="100000"
                step="5000"
                value={shipDisplacement}
                onChange={(e) => setShipDisplacement(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500">({(shipDisplacement / 1000).toFixed(0)}千トン相当 - 積載状態により変動)</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                船の水平面積: {shipArea.toLocaleString()} m²
              </label>
              <input
                type="range"
                min="3000"
                max="10000"
                step="500"
                value={shipArea}
                onChange={(e) => setShipArea(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500">閘門面積の{((shipArea / CHAMBER_AREA) * 100).toFixed(1)}%</p>
            </div>
          </div>

          {/* Ship Movement */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-semibold mb-3">船の位置: {
              shipPosition === 'upper' ? '上流' :
              shipPosition === 'chamber' ? '閘門内' :
              '下流'
            }</p>
            <div className="flex gap-3 justify-center items-center">
              <button
                onClick={() => moveShip('toUpper')}
                disabled={shipPosition !== 'chamber' || upperGate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} />
                上流へ
              </button>
              <button
                onClick={() => moveShip('toChamber')}
                disabled={shipPosition === 'chamber' || (shipPosition === 'upper' && upperGate) || (shipPosition === 'lower' && lowerGate)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                閘門へ
              </button>
              <button
                onClick={() => moveShip('toLower')}
                disabled={shipPosition !== 'chamber' || lowerGate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                下流へ
                <ArrowRight size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              ※ゲートが開いている時のみ移動可能
            </p>
          </div>

          {shipPosition === 'chamber' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>⚠️ 重要：船による水位の見え方</strong>
              </p>
              <div className="text-sm text-yellow-800 space-y-1">
                <div className="flex justify-between">
                  <span>・基準水位（水のみ）:</span>
                  <span className="font-mono font-bold">{chamberLevel.toFixed(2)} m</span>
                </div>
                <div className="flex justify-between">
                  <span>・表示水位（船の影響込み）:</span>
                  <span className="font-mono font-bold">{actualChamberLevel.toFixed(2)} m</span>
                </div>
                <div className="flex justify-between">
                  <span>・船による上昇:</span>
                  <span className="font-mono font-bold">+{getShipWaterLevelRise('chamber').toFixed(2)} m</span>
                </div>
              </div>
              <p className="text-xs text-yellow-700 mt-2 border-t border-yellow-300 pt-2">
                💡 <strong>ゲートを開く条件：</strong>船がいる場合、<strong>表示水位</strong>が隣接する水域と同じになる必要があります。
                船の排水量分の水が含まれているため、基準水位だけでは不十分です。
              </p>
            </div>
          )}
        </div>
<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">閘門断面図</h2>
          <div className="flex items-end justify-around h-96 border-b-4 border-gray-800 relative">
            <div className="relative w-1/4 h-full flex flex-col justify-end">
              <div className="absolute inset-0 border-l-2 border-r-2 border-gray-500 pointer-events-none"></div>
              <div className="absolute bottom-full left-0 right-0 text-center font-semibold mb-2">上流</div>
              <div
                className="bg-blue-400 w-full transition-all duration-300 relative"
                style={{ height: `${scale(upperLevel)}%` }}
              >
                <div className="text-white font-bold pt-2 px-2">{upperLevel.toFixed(1)}m</div>
                {shipPosition === 'upper' && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full w-16 h-8 bg-gray-700 rounded-t-lg border-2 border-gray-900 mb-1">
                    <Ship size={16} className="text-white mx-auto mt-1" />
                  </div>
                )}
              </div>
            </div>

            <div className="relative w-1/4 h-full flex flex-col justify-end">
              <div className="absolute inset-0 border-l-4 border-r-4 border-gray-700 pointer-events-none"></div>
              <div className="absolute bottom-full left-0 right-0 text-center font-semibold mb-2">閘門</div>
              <div
                className="bg-blue-500 w-full transition-all duration-300 relative"
                style={{ height: `${scale(actualChamberLevel)}%` }}
              >
                <div className="text-white font-bold pt-2 px-2">
                  {actualChamberLevel.toFixed(1)}m
                  {shipPosition === 'chamber' && (
                    <div className="text-xs">
                      (表示水位)
                      <div className="text-xs opacity-80">基準: {chamberLevel.toFixed(1)}m</div>
                    </div>
                  )}
                </div>

                {shipPosition === 'chamber' && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full w-16 h-8 bg-gray-700 rounded-t-lg border-2 border-gray-900 mb-1">
                    <Ship size={16} className="text-white mx-auto mt-1" />
                  </div>
                )}
              </div>

              {upperGate && (
                <div className="absolute left-0 w-2 bg-red-700 z-20" style={{ height: '100%', top: 0 }}></div>
              )}
              {lowerGate && (
                <div className="absolute right-0 w-2 bg-red-700 z-20" style={{ height: '100%', bottom: 0 }}></div>
              )}
            </div>

            <div className="relative w-1/4 h-full flex flex-col justify-end">
              <div className="absolute inset-0 border-l-2 border-r-2 border-gray-500 pointer-events-none"></div>
              <div className="absolute bottom-full left-0 right-0 text-center font-semibold mb-2">下流</div>
              <div
                className="bg-blue-400 w-full transition-all duration-300 relative"
                style={{ height: `${scale(lowerLevel)}%` }}
              >
                <div className="text-white font-bold pt-2 px-2">{lowerLevel.toFixed(1)}m</div>
                {shipPosition === 'lower' && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full w-16 h-8 bg-gray-700 rounded-t-lg border-2 border-gray-900 mb-1">
                    <Ship size={16} className="text-white mx-auto mt-1" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-3">上部ゲート</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>水位差:</span>
                <span className="font-mono">{Math.abs(upperLevel - actualChamberLevel).toFixed(2)} m</span>
              </div>
              <div className="flex justify-between">
                <span>平均圧力:</span>
                <span className="font-mono">{upperGateForce.pressure.toFixed(1)} kPa</span>
              </div>
              <div className="flex justify-between">
                <span>総荷重:</span>
                <span className="font-mono font-bold text-lg">{upperGateForce.force.toFixed(0)} kN</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-3">下部ゲート</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>水位差:</span>
                <span className="font-mono">{Math.abs(actualChamberLevel - lowerLevel).toFixed(2)} m</span>
              </div>
              <div className="flex justify-between">
                <span>平均圧力:</span>
                <span className="font-mono">{lowerGateForce.pressure.toFixed(1)} kPa</span>
              </div>
              <div className="flex justify-between">
                <span>総荷重:</span>
                <span className="font-mono font-bold text-lg">{lowerGateForce.force.toFixed(0)} kN</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-3">閘門データ</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>閘門面積:</span>
                <span className="font-mono">{CHAMBER_AREA.toLocaleString()} m²</span>
              </div>
              <div className="flex justify-between">
                <span>有効面積:</span>
                <span className="font-mono">{getEffectiveChamberArea().toLocaleString()} m²</span>
              </div>
              <div className="flex justify-between">
                <span>基準水位:</span>
                <span className="font-mono">{chamberLevel.toFixed(2)} m</span>
              </div>
              {shipPosition === 'chamber' && (
                <div className="flex justify-between text-blue-600">
                  <span>船の影響:</span>
                  <span className="font-mono">+{getShipWaterLevelRise('chamber').toFixed(2)} m</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-2">運用手順</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>船が上流にある状態でスタート</li>
            <li>上部ゲートを開き、船を閘門へ移動</li>
            <li>上部ゲートを閉じる</li>
            <li>下部バルブで閘門の水位を調整する</li>
            <li><strong>重要：</strong>閘門の<strong>表示水位</strong>（船の影響込み）を下流と同じ10mにする</li>
            <li>水位差がゼロになったら下部ゲートを開く（荷重がゼロになる）</li>
            <li>船を下流へ移動</li>
          </ol>
          <div className="mt-3 bg-blue-100 rounded p-2 text-xs text-blue-800">
            <strong>💡 ポイント：</strong>船がいる場合、排水量分の水が追加されるため、基準水位を下げる必要があります。
            例：船で2.1m上昇する場合、基準水位を7.9mにすると表示水位が10mになります。
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
