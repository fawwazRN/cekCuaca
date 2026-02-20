import { useState, useEffect } from "react";
import axios from "./api/axios";
import { Search, Wind, Droplets, Cloud, Sun, CloudRain } from "lucide-react";

function App() {
  const [data, setData] = useState({});
  const [location, setLocation] = useState("");
  const [history, setHistory] = useState([]);

  const API_KEY = import.meta.env.VITE_WEATHER_KEY;
  const url = `/weather?q=${location}&units=metric&appid=${API_KEY}`;

  const saveToHistory = (city) => {
    const now = new Date().getTime();
    const expiry = now + 24 * 60 * 60 * 1000;
    let currentHistory =
      JSON.parse(localStorage.getItem("weatherHistory")) || [];
    currentHistory = currentHistory.filter(
      (item) => item.city.toLowerCase() !== city.toLowerCase(),
    );
    currentHistory.unshift({ city, expiry });
    currentHistory = currentHistory.slice(0, 10);
    localStorage.setItem("weatherHistory", JSON.stringify(currentHistory));
    localStorage.setItem("lastCity", city);
    setHistory(currentHistory);
  };
  const fetchWeatherByCity = async (city) => {
    try {
      const response = await axios.get(
        `/weather?q=${city}&units=metric&appid=${API_KEY}`,
      );
      setData(response.data);
      saveToHistory(city);
    } catch (error) {
      console.error(error);
      alert("Kota tidak ditemukan!");
    }
  };

  const searchLocation = async (event) => {
    if (event.key === "Enter") {
      if (!location.trim()) return;
      try {
        const response = await axios.get(url);
        setData(response.data);
        console.log(response.data);
        saveToHistory(location);
      } catch (error) {
        console.error(error);
        alert("Kota tidak ditemukan!");
      }
      setLocation("");
    }
  };

  const handleHistoryClick = (city) => {
    fetchWeatherByCity(city);
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem("weatherHistory");
    if (savedHistory) {
      const now = Date.now();
      const parsed = JSON.parse(savedHistory);
      const validHistory = parsed.filter((item) => now < item.expiry);
      localStorage.setItem("weatherHistory", JSON.stringify(validHistory));
      setHistory(validHistory);
    }

    const lastCity = localStorage.getItem("lastCity");

    if (lastCity) {
      fetchWeatherByCity(lastCity);
    } else {
      fetchWeatherByCity("Jakarta");
    }
  }, []);

  const getWeatherIcon = (main) => {
    switch (main) {
      case "Clouds":
        return <Cloud className="w-20 h-20 text-blue-200" />;
      case "Rain":
        return <CloudRain className="w-20 h-20 text-blue-400" />;
      case "Clear":
        return <Sun className="w-20 h-20 text-yellow-400" />;
      default:
        return <Cloud className="w-20 h-20 text-white" />;
    }
  };

  const formatTime = (unix) => {
    return new Date(unix * 1000).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col items-center bg-slate-900 min-h-screen text-white">
      {/* Search */}
      <div className="mt-12 px-4 w-full max-w-sm">
        <div className="relative">
          <Search
            size={18}
            className="top-1/2 left-4 absolute text-slate-400 -translate-y-1/2"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={searchLocation}
            placeholder="Cari kota..."
            className="bg-slate-800 py-3 pr-4 pl-11 border border-slate-700 focus:border-slate-500 rounded-xl focus:outline-none w-full placeholder:text-slate-500 text-sm"
          />
        </div>
      </div>

      {/* Weather Card */}
      {data.name && (
        <div className="mt-8 px-4 w-full max-w-sm">
          <div className="bg-slate-800 p-6 border border-slate-700 rounded-2xl text-center">
            {/* Date */}
            <p className="text-slate-400 text-xs">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>

            {/* Location */}
            <h1 className="mt-1 font-semibold text-2xl">{data.name}</h1>
            <p className="text-slate-400 text-xs tracking-wide">
              {data.sys?.country}
            </p>

            {/* Temperature */}
            <div className="flex flex-col items-center mt-6">
              {getWeatherIcon(data.weather?.[0]?.main)}
              <div className="mt-4 font-semibold text-6xl">
                {Math.round(data.main.temp)}
                <span className="ml-1 text-slate-400 text-3xl">°C</span>
              </div>
              <p className="mt-2 text-slate-400 text-xs uppercase tracking-widest">
                {data.weather?.[0]?.description}
              </p>
            </div>

            {/* Sunrise & Sunset */}
            <div className="gap-3 grid grid-cols-2 mt-6 text-sm">
              <div className="flex items-center gap-3 bg-slate-700/40 p-3 rounded-xl">
                <Sun size={18} className="text-yellow-400" />
                <div className="text-left">
                  <p className="text-slate-400 text-xs">Sunrise</p>
                  <p className="font-medium">{formatTime(data.sys.sunrise)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-700/40 p-3 rounded-xl">
                <Cloud size={18} className="text-orange-400" />
                <div className="text-left">
                  <p className="text-slate-400 text-xs">Sunset</p>
                  <p className="font-medium">{formatTime(data.sys.sunset)}</p>
                </div>
              </div>
            </div>

            {/* Humidity & Wind */}
            <div className="gap-3 grid grid-cols-2 mt-4 text-sm">
              <div className="flex items-center gap-3 bg-slate-700/40 p-3 rounded-xl">
                <Droplets size={18} className="text-blue-400" />
                <div className="text-left">
                  <p className="text-slate-400 text-xs">Humidity</p>
                  <p className="font-medium">{data.main.humidity}%</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-700/40 p-3 rounded-xl">
                <Wind size={18} className="text-blue-400" />
                <div className="text-left">
                  <p className="text-slate-400 text-xs">Wind</p>
                  <p className="font-medium">{data.wind.speed} m/s</p>
                </div>
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-[10px] text-slate-500 text-center uppercase tracking-widest">
                  Riwayat 24 Jam Terakhir
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {history.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(item.city)}
                      className="bg-slate-700/50 hover:bg-slate-600 px-3 py-1 rounded-full text-slate-200 text-xs transition">
                      {item.city}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
