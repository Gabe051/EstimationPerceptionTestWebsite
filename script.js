let random_val = [];
let previous_values = [];
let chart_values = [];
let new_values = [];
let mean_absolute_error = 0.0;
let standard_deviation = 0.0;

//Carousel slides
const cslides = document.querySelectorAll('.carousel-page');
let current_slide = 0;

document.getElementById('prevChart').addEventListener('click', () => {
    showSlide(current_slide - 1);
});

document.getElementById('nextChart').addEventListener('click', () => {
    showSlide(current_slide + 1);
})

const piectx = document.getElementById('piechart').getContext('2d');
let pieChart = new Chart(piectx,{
    type: 'pie',
    data: {
        labels: ['Undershot', 'Overshot', 'Exact'],
        datasets:[{
            data: [0,0,0],
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)'
            ]
        }]
    },
    options: {
        responsive:true,
        animation: false,
        borderWidth: 0,
        plugins: {
            legend: {
                display: true,
                labels: {
                    /*font:{
                        size: 16
                    },*/
                    color: 'white'
                }
            }
        }
    }
});

const scatterctx = document.getElementById('scatterplot').getContext('2d'); 
let scatterPlot = new Chart(scatterctx,{
    type:'scatter',
    data: {
        datasets: [
        {
            label: 'Guess plotted against True Value',
            data: [],
            backgroundColor: 'rgba(50,160,235,1)',
            pointRadius: 6
        },
        {
            label: 'Reference Line (y = x)',
            data: [ {x:0, y:0}, {x: 100, y: 100},],
            showLine: true,
            borderColor: 'rgb(207, 102, 102)',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 0
        }
        ]
    },
    options:{
        plugins: {
            legend: {
                labels:{
                    color: 'white',
                },
            },
        },
        scales: {
            x:{
                title: {
                    display: true,
                    text: "Actual Bar Percentage",
                    color: 'white',
                },
                type: 'linear',
                position: 'bottom', 
                min: 0,
                max: 100,
                ticks: {
                    color: 'white'
                },
                grid:{
                    color: 'rgba(255,255,255,0.15)'
                },
                border:{
                    color: 'white'
                }
            },
            y:{
                title: {
                    display: true,
                    text: 'Guessed Bar Percentage',
                    color: 'white',
                },
                type: 'linear',
                min: 0,
                max: 100,
                ticks: {
                    color: 'white'
                },
                grid:{
                     color: 'rgba(255,255,255,0.15)'
                },
                border:{
                    color: 'white'
                },
                
            }
        }
    }
})


async function onLoad(){
    await initialiseValues();
    generateBarValue();
}

window.addEventListener('DOMContentLoaded', onLoad);

function showSlide(index){
    cslides[current_slide].classList.remove('active');

    current_slide = (cslides.length + index) % cslides.length;
    cslides[current_slide].classList.add('active');
    console.log("Changing slide?");
    switch(current_slide){
        case 0:
            scatterPlot.resize();
            break;
        case 1:
            pieChart.resize();
            break;
    }
}

function updateGraphs(){
    let scatter_data = [];
    
    for(let i = 0; i < chart_values.length; i++){
        scatter_data.push({x: chart_values[i][3], y: chart_values[i][4]});
    }
    scatterPlot.data.datasets[0].data = scatter_data;

    scatterPlot.update();

    let pievalues = [0,0,0];

    for(const row of chart_values){
        switch(row[2]){
            case -1:
                pievalues[0] = pievalues[0] + 1;
                break;
            case 1:
                pievalues[1] = pievalues[1] + 1;
                break;
            case 0:
                pievalues[2] = pievalues[2] + 1;
        }
    }

    pieChart.data.datasets[0].data = pievalues;
    pieChart.update();
    pieChart.resize();
}


async function initialiseValues(){ 
    previous_values = await window.electron.readFile();
    chart_values = previous_values.slice();
    
    updateGraphs();
    //mean_absolute_error = previous_values.length > 0 ? ((previous_values.reduce(a,b)=>a+b,0) / previous_values.length) : 0.0;

}

function generateBarValue(){
    random_val = Math.floor(Math.random() * 100) + 1;
    const bar = document.getElementById("estimate-bar");
    bar.value = random_val;
}


async function handleClick(event){
    console.log("Handling Click");
    event.preventDefault();

    const form = document.getElementById("form-text");
    const error_p = document.getElementById("error-message");
    console.log("retrieved document objects");
    let num = form.value
    
    num = num.replace('%', '');

    let parsed_num = Number(num);

    if( (num.trim() === '') || (Number.isNaN(parsed_num)) || !Number.isInteger(parsed_num) ||  (parsed_num < 0)){
        error_p.classList.remove("hidden");
        form.value = "";
        return;
    }

    console.log("Verified number");
        
    error_p.classList.add("hidden");
    
    form.value = "";
    
    const abs_error = Math.abs(parsed_num - random_val);
    
    let overshot = (parsed_num < random_val) ? -1:  1;
    
    if(abs_error === 0) overshot = 0;

    let percentage_error = (abs_error / random_val * 100).toFixed(2);

    //const values = [[0.05],[0.02],[0.09],[0.1]];
    const writeValue = [[abs_error, percentage_error, overshot, random_val, parsed_num]];
    await window.electron.appendValue(writeValue);

    new_values.push([abs_error, percentage_error, overshot, random_val, parsed_num]);
    
    chart_values.push([abs_error, percentage_error, overshot, random_val, parsed_num]);
    console.log("Chart values: ");
    console.log(chart_values);
    updateGraphs();
}