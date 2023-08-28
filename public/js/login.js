/* eslint-disable*/


const login = async(email, password) => {
    console.log({email,password})
    try {
        const url = "http://localhost:3000/api/v1/users/login";
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
       
        if(res.status === 200){
          alert('Loggin in successfully')
          window.setTimeout(()=>{
            location.assign('/')
          },1500)
        }
        console.log(res)
        }
    catch(err){
        alert(err.message)
    }
};

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  console.log('tombol di tekan');
  login(email, password);
});
