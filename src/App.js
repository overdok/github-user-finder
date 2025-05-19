import { useState } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user data
      const userResponse = await fetch(`https://api.github.com/users/${username}`);
      if (!userResponse.ok) throw new Error('User not found');
      const userData = await userResponse.json();
      setUserData(userData);

      // Fetch user repositories
      const reposResponse = await fetch(userData.repos_url);
      const reposData = await reposResponse.json();
      setRepos(reposData);
    } catch (err) {
      setError(err.message);
      setUserData(null);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      fetchUserData();
    }
  };

  return (
    <div className="App">
      <h1>GitHub User Finder</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter GitHub username"
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="error">Error: {error}</p>}

      {userData && (
        <div className="user-profile">
          <div className="profile-header">
            <img src={userData.avatar_url} alt="User avatar" className="avatar" />
            <div>
              <h2>{userData.name || userData.login}</h2>
              <p>{userData.bio}</p>
              <p>
                <span>Followers: {userData.followers}</span> | 
                <span>Following: {userData.following}</span> | 
                <span>Public repos: {userData.public_repos}</span>
              </p>
            </div>
          </div>

          <h3>Repositories</h3>
          <div className="repos">
            {repos.map(repo => (
              <div key={repo.id} className="repo">
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                  {repo.name}
                </a>
                <p>{repo.description}</p>
                <div className="repo-stats">
                  <span>⭐ {repo.stargazers_count}</span>
                  <span>🍴 {repo.forks_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;