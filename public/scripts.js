const getFiglet = async () => {
    const textSend = await document.getElementById("figletInput").value;
    const response  = await fetch('http://127.0.0.1:8080/figlet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "text": textSend,
            "id": 1
        })
    });
    const myJson = await response.json();
    console.log(myJson["reply"]);
    document.getElementById("figletOutput").innerText = myJson['reply'];
}

const getPredict = async () => {
    document.getElementById("predictOutput").innerHTML = "";
    // Add image encoding step here
    var selectedFile = await document.getElementById("imageSelector").files[0];
    
    
    // var results = await ;
    const response = await fetch('http://127.0.0.1:8080/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body:  JSON.stringify({
            "image": await getBase64(selectedFile),
            "id": 1
        })
    });
    const myJson = await response.json();
    console.log(myJson["reply"]);
    for (let x in myJson) {
        myJson[x].forEach(element => {
            document.getElementById("predictOutput").innerHTML += JSON.stringify(element) + "<br />   ";
        });
    }
}

function getBase64(file) {
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            resolve(reader.result.split(",").pop());
        }
        reader.onerror = error => reject(error);
    });
}

function previewImage() {
    var selectedFile = document.getElementById("imageSelector").files[0];

    var reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById("predictInput").src = e.target.result;
    };
    reader.readAsDataURL(selectedFile);
}

// const getDoggo = async () => {
//     var img = new Image();
//     img.src = "https://images.dog.ceo/breeds/pomeranian/n02112018_276.jpg";
//     document.getElementById("predictInput").src = img.src;
// }