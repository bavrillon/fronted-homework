let adresse = document.getElementById("adresse").value; // Modification de l'ex-constante "const" pour permettre de changer de map avec un boutton
let carte = document.getElementById("map").value; // Idem
console.log({adresse,carte})

const mapElement = document.querySelector("#map-container")

document.getElementById("load-button").addEventListener("click", function () {
    adresse = document.getElementById("adresse").value;
    carte = document.getElementById("map").value;
    preinit();
  });


async function preinit() {
    const res = await fetch(
        `${adresse}/api/v1/${carte}/preinit`,
        {credentials : "include"}
    );
    const {key} = await res.json();
    console.log(key);

    init(key)
}



async function init(key) {
    const res = await fetch(
        `${adresse}/api/v1/${carte}/init?key=${key}`,
        {credentials : "include"}
    );

    const {id,nx,ny,timeout,data} = await res.json();
    console.log(data);

    let contenu = ""
    for (let li = 0; li< nx; li++){
        for (let col = 0; col< ny; col++){
            const [r,g,b] = data[li][col] ;
            contenu += `<div class="pixel" id="l${li}_c${col}" style="background-color: rgb(${r},${g},${b})"></div>`;
        }
    }

    mapElement.innerHTML = contenu;
    mapElement.style.gridTemplateColumns = `repeat(${nx},10px)`;
    mapElement.style.gridTemplateRows = `repeat(${ny},10px)`;

    for (let li = 0; li< nx; li++){
        for (let col = 0; col< ny; col++){
            document.getElementById(`l${li}_c${col}`).addEventListener('click',() => {
                setColor(id, li, col) ;
            });
        }
    }

    setInterval(
        () => deltas(id),
        500
    )
}



async function deltas(id) {
    const res = await fetch(
        `${adresse}/api/v1/${carte}/deltas?id=${id}`,
        {credentials : "include"}
    );
    const {deltas} = await res.json();

    for (const [x,y,r,g,b] of deltas) {
        console.log("delta",[x,y,r,g,b]);
        const pixel = document.querySelector(`#l${x}_c${y}`);
        pixel.style.backgroundColor = `rgb(${r},${g},${b})`;
    }
}



async function setColor(id,li,col) {
    const couleur = document.getElementById("couleur").value;
    const pixel_r = hexadecimalVersRGB(couleur).r;
    const pixel_g = hexadecimalVersRGB(couleur).g;
    const pixel_b = hexadecimalVersRGB(couleur).b;

    console.log(`Demande de chgmt pixel : (${li},${col})`);

    const res = await fetch(
        `${adresse}/api/v1/${carte}/set/${id}/${li}/${col}/${pixel_r}/${pixel_g}/${pixel_b}`,
        {credentials : "include"}
    );
    const response = parseInt(await res.text());
    console.log("Chgmt pixel :", response);

    if (response != 0){
        startCountdown(response);
    }
}



function startCountdown(ms) {
    let seconds = parseInt(ms/(10**9))
    const countdown = document.getElementById('countdown');
    const timer = document.getElementById('timer');
    const visual = document.getElementById('visual');
    
    countdown.style.display = 'block'; // Afficher le compte à rebours
    timer.textContent = seconds;
    visual.textContent = '-'.repeat(seconds);

    const intervalId = setInterval(() => {
        seconds--;
        timer.textContent = seconds;
        visual.textContent = '-'.repeat(seconds);

        if (seconds <= 0) {
            countdown.style.display = 'none'; // Cacher le compte à rebours quand terminé
            clearInterval(intervalId);
        }
    }, 1000);
}



function hexadecimalVersRGB(hexadecimal) {
    hexadecimal = hexadecimal.replace("#", "");
    const r = parseInt(hexadecimal.substring(0, 2), 16);
    const g = parseInt(hexadecimal.substring(2, 4), 16);
    const b = parseInt(hexadecimal.substring(4, 6), 16);
    return { r, g, b };
}



preinit();