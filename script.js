var random_val;

function generateBarValue(){
    random_val = Math.floor(Math.random() * 100);
    const bar = document.getElementById("estimate-bar");
    bar.value = random_val;
}

function handleClick(){
    event.preventDefault();
    const form = document.getElementById("form-text");
    let num = form.value
    num = num.replace('%', '');
    let parsed_num = Number(num);
    if( (parsed_num == NaN) || !Number.isInteger(parsed_num) ||  (parsed_num < 0)){
        const error_p = document.getElementById("error-message");
        error_p.classList.remove("hidden");
        form.value = "";
        return;
    }
        
    error_p.classList.add("hidden");
    
    
    form.value = "";
    
}