import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Link, Routes, useParams } from 'react-router-dom';
import { createBrowserHistory as useHistory } from 'history';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <Link className="navbar-brand heading" to="/">TV Shows</Link>
        </nav>

        <Routes>
          <Route path="/" element={<ShowList />} />
          <Route path="/show/:id" element={<ShowSummary />} />
          <Route path="/book-ticket/:id" element={<BookTicket />} />
        </Routes>

      </div>
    </Router>
  );
}

function ShowList() {
  const [shows, setShows] = useState([]);

  useEffect(() => {
    axios
      .get('https://api.tvmaze.com/search/shows?q=all')
      .then((response) => {
        setShows(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div className="container">
      <h2>TV Shows</h2>
      <div className="row">
        {shows.map((show) => (
          <div className="col-sm-4" key={show.show.id}>
            <div className="card mb-3">
              <img src={show.show.image?.medium} className="card-img-top" alt={show.show.name} />
              <div className="card-body">
                <h5 className="card-title">{show.show.name}</h5>
                <p className="card-text">Rating: {show.show.rating?.average || 'N/A'}</p>
                <p className="card-text">Language: {show.show.language}</p>
                <p className="card-text">Genres: {show.show.genres?.join(', ') || 'N/A'}</p>
                <p className="card-text">Runtime: {show.show.runtime || 'N/A'} minutes</p>
                <Link to={`/show/${show.show.id}`} className="btn btn-primary">View Summary</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function ShowSummary() {
  const { id } = useParams();
  const [show, setShow] = useState(null);

  useEffect(() => {
    axios.get(`https://api.tvmaze.com/shows/${id}`)
      .then(response => {
        setShow(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, [id]);

  const removeTags = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="container">
      {show ? (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">{removeTags(show.name)}</h5>
            <p className="card-text">{removeTags(show.summary)}</p>
            <Link to={`/book-ticket/${show.id}`} className="btn btn-primary">Book Ticket</Link>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

function BookTicket() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    showId: id,
    showName: ''
  });

  const history = useHistory();

  useEffect(() => {
    axios.get(`https://api.tvmaze.com/shows/${id}`)
      .then(response => {
        setFormData(formData => ({
          ...formData,
          showName: response.data.name
        }));
      })
      .catch(error => {
        console.error(error);
      });
  }, [id]);

  const handleChange = e => {
    setFormData(formData => ({
      ...formData,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    localStorage.setItem('userData', JSON.stringify(formData));
    history.push(`/show/${id}`);
  };

  return (
    <div className="container">
      <h2>Book Ticket for {formData.showName}</h2>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;