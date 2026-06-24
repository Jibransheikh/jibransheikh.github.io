document.addEventListener("DOMContentLoaded", () => {
    // Initialize AOS with extreme subtlety
    // We are deliberately keeping offset low and disabling it on mobile for speed
    AOS.init({
        duration: 600,
        easing: 'ease-out-cubic',
        once: true,
        offset: 50,
        disable: 'mobile' 
    });
    
    // Developer Console Easter Egg
    const terminalArt = `
       JS.
      /   \\
     /     \\
    +-------+
    | MATRIX|
    +-------+
    `;
    console.log(`%c${terminalArt}`, "color: #F07826; font-family: monospace; font-weight: bold;");
    console.log("%c JS. PORTFOLIO V2 %c SYSTEM OPERATIONAL ", "background:#121212; color:#fff; font-weight:bold; padding:2px 5px;", "background:#F07826; color:#000; font-weight:bold; padding:2px 5px;");
    console.log("%cInspecting the DOM? Let's skip the small talk: Jibransheikh.work@gmail.com", "color: #94a3b8; font-family: monospace; font-size: 12px; margin-top: 5px;");
});