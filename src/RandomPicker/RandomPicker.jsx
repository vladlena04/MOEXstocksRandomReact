import React, { useState, useEffect, useCallback } from "react";
import "../styles.css";

const RandomPicker = () => {
  const [stocks, setStocks] = useState([]);
  const [curStock, setCurStock] = useState("");
  const [proc, setProc] = useState(0);
  const [period, setPeriod] = useState("");

  const fetchCost = useCallback(
    async (stock, datePre, dateNow) => {
      try {
        const urlCostPre = `https://iss.moex.com/iss/history/engines/stock/markets/shares/boards/TQBR/securities/${stock}.json?iss.meta=off&iss.only=history&history.columns=SECID,TRADEDATE,CLOSE&limit=50&from=${datePre}`;
        const responsePre = await fetch(urlCostPre);
        const dataPre = await responsePre.json();
        const infoPre = dataPre.history.data.filter((data) => data[2] != null);
        const costPre = infoPre[0][2];
        const datePrev = infoPre[0][1];
        setPeriod(`с ${datePrev}`);

        const urlCostNow = `https://iss.moex.com/iss/history/engines/stock/markets/shares/boards/TQBR/securities/${stock}.json?iss.meta=off&iss.only=history&history.columns=SECID,TRADEDATE,CLOSE&limit=50&from=${dateNow}`;
        const responseNow = await fetch(urlCostNow);
        const dataNow = await responseNow.json();
        const infoNow = dataNow.history.data.filter((data) => data[2] != null);
        const costNow = infoNow[0][2];
        const proc = (costNow * 100) / costPre - 100;
        setProc(proc.toFixed(2));
      } catch (error) {
        console.error("Error fetching cost:", error);
      }
    },
    [setPeriod, setProc]
  );

  const newStock = useCallback(
    (stocks) => {
      const random = Math.floor(Math.random() * stocks.length);
      const newStock = stocks[random];
      setCurStock(newStock);

      const now = new Date();
      const dateRequestNow = `${now.getFullYear()}-${now.getMonth() + 1}-${
        now.getDate() - 1
      }`;
      const dateRequestPre = `${now.getFullYear() - 5}-${now.getMonth() + 1}-${
        now.getDate() - 1
      }`;

      fetchCost(newStock, dateRequestPre, dateRequestNow);
    },
    [fetchCost]
  );

  useEffect(() => {
    const urls = [
      "https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json?iss.meta=off&iss.only=securities&securities.columns=SECID",
      "https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQDE/securities.json?iss.meta=off&iss.only=securities&securities.columns=SECID",
    ];

    const fetchStocks = async () => {
      try {
        const responses = await Promise.all(urls.map((url) => fetch(url)));
        const data = await Promise.all(responses.map((res) => res.json()));
        const allStocks = data.flatMap((result) => result.securities.data);
        setStocks(allStocks);
        newStock(allStocks);
      } catch (error) {
        console.error("Error fetching stocks:", error);
      }
    };

    fetchStocks();
  }, [newStock]);

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100">
      <div className="card card-custom">
        <div className="card-header text-center">
          <h4 className="my-0 font-weight-normal">
            Случайная акция Мосбиржи и ее рост с 2014 года 🎯
          </h4>
        </div>
        <div className="card-body d-flex flex-column align-items-center">
          <h1 className="card-title pricing-card-title mb-4">
            {curStock || "Загрузка..."}
          </h1>
          <div className="d-flex justify-content-center mb-4">
            <span className="mr-3 display-4">{proc}% </span>
            <span className="display-4">{period}</span>
          </div>
          <div>
            <a
              id="moex"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.moex.com/ru/issue.aspx?board=TQBR&code=${curStock}`}
              className="btn btn-primary mb-4 btn-lg"
            >
              🏦 Мосбиржа
            </a>
          </div>
          <div>
            <button
              className="btn btn-lg btn-secondary btn-block btn-filled"
              onClick={() => newStock(stocks)}
            >
              Обновить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomPicker;
  