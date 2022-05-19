import React, { useEffect, useState } from "react";
import "./App.css";
import {
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import Infobox from "./Infobox";
import Map from "./Map";
import Table from "./Table";
import { prettyPrintStat, sortData } from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";
const App = () => {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    const fetchCountries = async () => {
      const response = await fetch("https://disease.sh/v3/covid-19/countries");
      const data = await response.json();
      // console.log(data);

      setCountries(
        data.map((country) => ({
          name: country.country,
          value: country.countryInfo.iso2,
        }))
      );

      const sortedData = sortData(data);
      setTableData(sortedData);
      setMapCountries(data);

      const response1 = await fetch("https://disease.sh/v3/covid-19/all");
      const data1 = await response1.json();
      setCountryInfo(data1);
      console.log("222", countryInfo);
    };
    fetchCountries();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    console.log("11", countryCode);

    // console.log("12", country);

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    const res = await fetch(url);
    const data = await res.json();
    setCountry(countryCode);
    setCountryInfo(data);
    setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
    setMapZoom(4);
  };
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>Covid 19 tracker</h1>
          <FormControl className="app__dropdown">
            <Select
              value={country}
              variant="outlined"
              onChange={onCountryChange}
            >
              <MenuItem value={country}>{country}</MenuItem>
              {countries.map((country) => (
                <MenuItem key={country._id} value={country.value}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <Infobox
            isRed
            active={casesType === "cases"}
            onClick={() => setCasesType("cases")}
            title="Coronavirus Cases"
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={prettyPrintStat(countryInfo.cases)}
          />
          <Infobox
            active={casesType === "recovered"}
            onClick={() => setCasesType("recovered")}
            title="Recovered"
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={prettyPrintStat(countryInfo.recovered)}
          />
          <Infobox
            isRed
            active={casesType === "deaths"}
            onClick={() => setCasesType("deaths")}
            title="Deaths"
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={prettyPrintStat(countryInfo.deaths)}
          />
        </div>

        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>

      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by country</h3>
          <Table countries={tableData} />
          <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
          <LineGraph
            className="app__graph"
            data={tableData}
            options
            casesType={casesType}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
