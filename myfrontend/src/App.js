import "./App.css";
import { useEffect, useState } from "react";
function App() {
  const [apires, setApiRes] = useState("No Respone");
  const [userdata, setUserData] = useState(null);
  const [registerdata, setRegisterData] = useState({
    email: "",
    password: "",
    age: 0,
    name: "",
  });
  const [logindata, setLoginData] = useState({
    email: "",
    password: ""
  });

  const checkApi = () => {
    fetch("http://localhost:5000")
      .then((res) => res.json())
      .then((data) => {
        setApiRes(data.message);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    checkApi();
  }, []);

  const handleRegister = () =>{
    console.log(registerdata);

    fetch('http://localhost:5000/register',{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify(registerdata)
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message)
    }).catch(err => console.log(err))
  }
  
  const handleLogin = () =>{
    console.log(logindata);

    fetch('http://localhost:5000/login',{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify(logindata)
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message)
      console.log(data.accessToken);
      localStorage.setItem('accessToken',data.accessToken);
    }).catch(err => console.log(err))
  }

  const getSavedToken = ()=>{
    const token = localStorage.getItem('accessToken');
    console.log(token);
  }

  const getUserData = ()=>{
    const token = localStorage.getItem('accessToken');
   
    fetch("http://localhost:5000/getmyprofile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization":`Bearer ${token}`
      },
    })
    .then(res=>res.json())
    .then(data=>setUserData(data.user))
    .catch(err=>console.log(err));

  }

  return (
    <div className="App">
      {/* <header className="App-header"> */}
      {/* <p>{apires}</p> */}
      {/* </header> */}

      <h1>Register Form</h1>
      <input
        type="text"
        name="email"
        placeholder="email"
        onChange={(e) =>
          setRegisterData({ ...registerdata, [e.target.name]: e.target.value })
        }
      />
      <input
        type="password"
        name="password"
        placeholder="password"
        onChange={(e) =>
          setRegisterData({ ...registerdata, [e.target.name]: e.target.value })
        }
      />
      <input
        type="text"
        name="name"
        placeholder="name"
        onChange={(e) =>
          setRegisterData({ ...registerdata, [e.target.name]: e.target.value })
        }
      />
      <input
        type="number"
        name="age"
        placeholder="age"
        onChange={(e) =>
          setRegisterData({ ...registerdata, [e.target.name]: e.target.value })
        }
      />
      <button onClick={handleRegister}>Register</button>

      <br />
      <br />
      <br />
      <br />

      <h1>Login Form</h1>
      <input
        type="text"
        name="email"
        placeholder="email"
        onChange={(e) =>
          setLoginData({ ...logindata, [e.target.name]: e.target.value })
        }
      />
      <input
        type="password"
        name="password"
        placeholder="password"
        onChange={(e) =>
          setLoginData({ ...logindata, [e.target.name]: e.target.value })
        }
      />

      <button onClick={handleLogin}>Login</button>

      <br />
      <br />
      <br />

      <button onClick={getSavedToken}>SavedToken</button>

      <br />
      <br />

      <button onClick={getUserData}>User Data</button>
      <h1>User data</h1>
      {
        userdata && JSON.stringify(userdata)
      }
    </div>
  );
}

export default App;
