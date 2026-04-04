document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("Acknowledged")) {
        document.body.innerHTML += `
        <div id="overlay">
            <div id="overlay-content">
                <h2>Website Under Development</h2>
                <p>This website is currently under development. All elements and content are works in progress.</p>
                <a href="#acknowledge" id="acknowledge-link" onclick="document.querySelector('#overlay').style.display='none'">I Understand</a>
            </div>
        </div>`;

        document.querySelector("#acknowledge-link").addEventListener("click", () => {
            document.querySelector("#overlay").style.display="none";
            localStorage.setItem("Acknowledged", true);
        });
    }
});