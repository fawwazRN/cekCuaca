import { useState, useEffect } from "react";
import axios from "./api/axios";
import { Search, Wind, Droplets, Cloud, Sun, CloudRain } from "lucide-react";

function App() {
  const [data, setData] = useState({});
  const [location, setLocation] = useState("");

  const API_KEY = import.meta.env.VITE_WEATHER_KEY;
  const url = `/weather?q=${location}&units=metric&appid=${API_KEY}`;

  const searchLocation = async (event) => {
    if (event.key === "Enter") {
      try {
        const response = await axios.get(url);
        setData(response.data);
        console.log(response.data);
      } catch (error) {
        console.error(error);
        alert("Kota tidak ditemukan!");
      }
      setLocation("");
    }
  };

  useEffect(() => {
    const fetchDefault = async () => {
      try {
        const response = await axios.get(
          `/weather?q=Jakarta&units=metric&appid=${API_KEY}`,
        );
        setData(response.data); // Set datanya ke state
      } catch (error) {
        console.log(error);
      }
    };

    fetchDefault();
  }, [API_KEY]);

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

  return (
    <div className="flex flex-col items-center bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 min-h-screen font-sans text-white antialiased">
      {/* Search Section */}
      <div className="mt-16 px-4 w-full max-w-md">
        <div className="group relative">
          <Search
            className="top-1/2 left-4 absolute text-white/40 group-focus-within:text-blue-400 transition-colors -translate-y-1/2"
            size={20}
          />
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            onKeyPress={searchLocation}
            placeholder="Cari Kota..."
            className="bg-white/10 shadow-xl backdrop-blur-lg py-4 pr-4 pl-12 border border-white/20 focus:border-blue-400 rounded-2xl outline-none w-full placeholder:text-white/30 transition-all duration-300"
          />
        </div>
      </div>

      {/* Weather Display Section */}
      {data.name && (
        <div className="mt-10 px-4 w-full max-w-md animate-in duration-500 fade-in zoom-in">
          <div className="relative bg-white/10 shadow-2xl backdrop-blur-xl p-8 border border-white/20 rounded-[2.5rem] overflow-hidden text-center">
            {/* Dekorasi Cahaya di Belakang */}
            <div className="-top-10 -right-10 absolute bg-blue-500/20 blur-3xl rounded-full w-32 h-32"></div>

            <p className="mb-1 font-medium text-blue-200 text-lg">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <h1 className="mb-8 font-bold text-4xl tracking-tight">
              {data.name}
            </h1>

            <div className="flex flex-col items-center mb-8">
              {getWeatherIcon(data.weather ? data.weather[0].main : "")}
              <div className="mt-4">
                <span className="font-black text-8xl tracking-tighter">
                  {data.main?.temp.toFixed()}
                </span>
                <span className="font-light text-blue-300 text-4xl">°C</span>
              </div>
              <p className="mt-2 font-medium text-blue-100 text-xl uppercase tracking-[0.2em]">
                {data.weather ? data.weather[0].description : null}
              </p>
            </div>

            {/* Grid Info Detail */}
            <div className="gap-4 grid grid-cols-2 mt-8 pt-8 border-white/10 border-t">
              <div className="flex justify-center items-center gap-3 bg-white/5 p-4 rounded-2xl">
                <Droplets className="text-blue-400" size={24} />
                <div className="text-left">
                  <p className="text-blue-200/60 text-xs uppercase">
                    Kelembapan
                  </p>
                  <p className="font-bold text-lg">{data.main?.humidity}%</p>
                </div>
              </div>
              <div className="flex justify-center items-center gap-3 bg-white/5 p-4 rounded-2xl">
                <Wind className="text-blue-400" size={24} />
                <div className="text-left">
                  <p className="text-blue-200/60 text-xs uppercase">Angin</p>
                  <p className="font-bold text-lg">
                    {data.wind?.speed}{" "}
                    <span className="font-normal text-xs">m/s</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
