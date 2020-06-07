import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Link, useHistory } from "react-router-dom";
import {
  FiArrowLeft,
  FiHome,
  AiOutlineWhatsApp,
  MdEmail,
  FiMapPin,
} from "react-icons/all";

import { Map, TileLayer, Marker } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";
import api from "../../services/api";
import externalApi from "../../services/externalApi";
import { toast } from "react-toastify";

import Dropzone from "../../components/DropZone";

import "./styles.css";

import logo from "../../assets/logo.svg";

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [formData, setFormDada] = useState({
    nome: "",
    email: "",
    whatsapp: "",
  });

  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  const [selectedUf, setSelectedUf] = useState("o");
  const [selectedCity, setSelectedCity] = useState("o");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();

  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      setInitialPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    api.get("items").then((res) => {
      setItems(res.data);
    });
  }, []);

  useEffect(() => {
    externalApi.get<IBGEUFResponse[]>("/").then((res) => {
      const ufInitials = res.data.map((uf) => uf.sigla);

      setUfs(ufInitials);
    });
  }, []);

  useEffect(() => {
    if (selectedUf === "0") {
      return;
    }

    externalApi
      .get<IBGECityResponse[]>(`/${selectedUf}/municipios`)
      .then((res) => {
        const cityNames = res.data.map((city) => city.nome);

        setCities(cityNames);
      });
  }, [selectedUf]);

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;

    setSelectedUf(uf);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;

    setSelectedCity(city);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormDada({ ...formData, [name]: value });
  }

  function handleSelectItem(id: number) {
    const alreadySelect = selectedItems.findIndex((item) => item === id);
    if (alreadySelect >= 0) {
      const filteredItems = selectedItems.filter((item) => item !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { nome, email, whatsapp } = formData;
    const uf = selectedUf;
    const cidade = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();

    data.append("nome", nome);
    data.append("email", email);
    data.append("whatsapp", whatsapp);
    data.append("cidade", cidade);
    data.append("uf", uf);
    data.append("latitude", String(latitude));
    data.append("longitude", String(longitude));
    data.append("items", items.join(","));

    if (selectedFile) {
      data.append("image", selectedFile);
    }

    await api.post("points", data);

    toast.success("Ponto criado com SUCESSO!", {
      position: "top-left",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    history.push("/");
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="E-Coleta" />

        <Link to="/">
          <FiArrowLeft size={36} />
          <FiHome size={36} />
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastre um ponto de coleta.</h1>
        <Dropzone onFileUploaded={setSelectedFile} />
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="nome">Nome da entidade</label>
            <input
              type="text"
              name="nome"
              id="nome"
              onChange={handleInputChange}
            />
          </div>
          <div className="field-group">
            <div className="field">
              <MdEmail size={34} />
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <AiOutlineWhatsApp size={34} />
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>
              <FiMapPin size={36} />
            </span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                name="uf"
                id="uf"
                value={selectedUf}
                onChange={handleSelectUf}
              >
                <option value="0">Selecine uma UF</option>
                {ufs.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                value={selectedCity}
                onChange={handleSelectCity}
              >
                <option value="0">Selecine uma Cidade</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Itens</h2>
          </legend>
          <ul className="items-grid">
            {items.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? "selected" : ""}
              >
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>
        <button type="submit">Cadastrar ponto</button>
      </form>
    </div>
  );
};

export default CreatePoint;

// TIPS array ou object: Manualmente informar o tipo de variavel
