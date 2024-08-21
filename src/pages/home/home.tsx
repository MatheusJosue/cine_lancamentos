import { useEffect, useState } from "react";
import "./styles.css";
import favLogo from "../../assets/images/favLogo.png";
import play from "../../assets/images/play.png";
import { ImStarFull } from "react-icons/im";
import { FiSearch } from "react-icons/fi";
import api from "../../api/api";
import { Film, FilmsData, Video } from "./types";
import VideoModal from "../modals/map/video";

export default function Home() {
  const [errorMessage, setErrorMessage] = useState("");
  const [films, setFilms] = useState<Film[] | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [expandedFilmId, setExpandedFilmId] = useState<number | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const handleSearch = async () => {
    try {
      const response = await api.get<FilmsData>("movie/popular");
      const filmsData = response.data.results;

      // Para cada filme, buscar o trailer
      const filmsWithTrailers = await Promise.all(
        filmsData.map(async (film) => {
          const trailerKey = await fetchTrailer(film.id);
          return { ...film, trailer_key: trailerKey };
        })
      );

      setFilms(filmsWithTrailers);
    } catch {
      setErrorMessage("Ops, erro ao buscar filmes populares");
      clearErrorMessageAfterDelay();
    }
  };

  const fetchTrailer = async (filmId: number): Promise<string | null> => {
    try {
      const response = await api.get<{ results: Video[] }>(
        `movie/${filmId}/videos`
      );
      const video = response.data.results.find(
        (video) => video.type === "Trailer" && video.site === "YouTube"
      );
      return video ? video.key : null;
    } catch {
      return null;
    }
  };

  const handleSearchByTitle = async () => {
    try {
      if (searchTitle != "") {
        const response = await api.get<FilmsData>("search/movie", {
          params: {
            query: searchTitle,
          },
        });
        const filmsData = response.data.results;

        // Para cada filme, buscar o trailer
        const filmsWithTrailers = await Promise.all(
          filmsData.map(async (film) => {
            const trailerKey = await fetchTrailer(film.id);
            return { ...film, trailer_key: trailerKey };
          })
        );

        setFilms(filmsWithTrailers);
        setSearchTitle("");
      }
    } catch {
      setErrorMessage("Ops, erro ao buscar filmes");
      clearErrorMessageAfterDelay();
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      handleSearchByTitle();
    }
  };

  const clearErrorMessageAfterDelay = () => {
    setTimeout(() => {
      setErrorMessage("");
    }, 3000);
  };

  const addFav = (id: number) => {
    setFavorites((prevFavorites) => {
      const updatedFavorites = [...prevFavorites, id];
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  };

  const removeFav = (id: number) => {
    setFavorites((prevFavorites) => {
      const updatedFavorites = prevFavorites.filter((favId) => favId !== id);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  };

  const isFavorite = (id: number) => {
    return favorites.includes(id);
  };

  const handleFavoriteFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setShowFavoritesOnly(event.target.checked);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTitle(event.target.value);
  };

  const toggleCollapse = (id: number) => {
    setExpandedFilmId((prevId) => (prevId === id ? null : id));
  };

  const openTrailerModal = (key: string | null) => {
    setTrailerKey(key);
    setShowModal(true);
  };

  const closeTrailerModal = () => {
    setTrailerKey(null);
    setShowModal(false);
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const filteredFilms = showFavoritesOnly
    ? films?.filter((film) => isFavorite(film.id))
    : films;

  return (
    <div className="App">
      <div className="App-header">
        <div className="row w-100 mt-3">
          <div className="col-8 d-flex justify-content-center">
            <span className="title">
              <a href="http://localhost:3000" rel="noopener noreferrer">
                <img className="sizeImg me-5" src={play} alt="Logo" />
              </a>
              <span className="title ms-5">Lançamentos de Filmes</span>
            </span>
          </div>
          <div className="col-4">
            {!errorMessage && (
              <div className="divInputs">
                <div className="containerInput">
                  <input
                    type="text"
                    placeholder="Digite o nome do filme"
                    name="film"
                    autoComplete="off"
                    value={searchTitle}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    className="buttonSearch"
                    onClick={handleSearchByTitle}
                  >
                    <FiSearch size={25} color="black" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {!errorMessage && (
          <div className="row w-100">
            <div className="col-3 mt-3 divInputs">
              <div className="containerInputToggle">
                <div className="checkbox-wrapper">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={showFavoritesOnly}
                      onChange={handleFavoriteFilterChange}
                    ></input>
                    <span className="slider round"></span>
                  </label>
                  <span className="ms-2 text-white">
                    Apenas filmes favoritos
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row w-100 mb-3">
          {filteredFilms &&
            filteredFilms.map((film: Film) => (
              <div key={film.id} className="col-3">
                <div className="card p-3">
                  <h1 className="titleFilm">{film.title}</h1>
                  <img
                    className="filmImage"
                    onClick={() => openTrailerModal(film.trailer_key ?? null)}
                    src={`https://image.tmdb.org/t/p/w500${film.poster_path}`}
                    alt={film.title}
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      cursor: film.trailer_key ? "pointer" : "default",
                    }}
                  />

                  <div className="row">
                    <div className="col-6">
                      <span
                        className="description"
                        onClick={(e) => {
                          e.stopPropagation();
                          isFavorite(film.id)
                            ? removeFav(film.id)
                            : addFav(film.id);
                        }}
                      >
                        Favoritar
                        {isFavorite(film.id) ? (
                          <i className="bi bi-heart-fill red ms-2"></i>
                        ) : (
                          <i className="bi bi-heart red ms-2"></i>
                        )}
                      </span>
                    </div>
                    <div className="col-6">
                      <span className="description">
                        <ImStarFull className="me-1 yellow" />{" "}
                        {film.vote_average}
                      </span>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-12 justify-center">
                      <i
                        className={`bi ${
                          expandedFilmId === film.id
                            ? "bi-chevron-double-up white sizeIcon"
                            : "bi-chevron-double-down white sizeIcon"
                        }`}
                        style={{ cursor: "pointer" }}
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${film.id}`}
                        aria-expanded={expandedFilmId === film.id}
                        aria-controls={`collapse${film.id}`}
                        onClick={() => toggleCollapse(film.id)}
                      ></i>
                    </div>
                    <div
                      className={`collapse ${
                        expandedFilmId === film.id ? "show" : ""
                      }`}
                      id={`collapse${film.id}`}
                    >
                      <hr className="line"></hr>
                      <span className="descriptionFilm">{film.overview}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
        {errorMessage && (
          <div className="row rowErrorHeight">
            <div className="col-12">
              <div className="cardError">
                <div className="error-message">{errorMessage}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="positionAbsolute">
        <a
          href="https://github.com/MatheusJosue"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img className="sizeImg" src={favLogo} alt="Logo" />
        </a>
      </div>

      <VideoModal
        show={showModal}
        handleClose={closeTrailerModal}
        trailerKey={trailerKey}
      />
    </div>
  );
}
