let random_val = [];
let previous_values = [];
let chart_values = [];
let new_values = [];
let mean_absolute_error = 0.0;
let standard_deviation = 0.0;

// Text stat elements
let mean_error_p = document.getElementById('meanErrorText');
let stddev_p = document.getElementById('stdDevText');
let prev_guess_p = document.getElementById('prevGuessText');
let prev_true_p = document.getElementById('prevTrueText');
let prev_error_p = document.getElementById('prevErrorText');
//Carousel slides elements
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

const boxplotctx = document.getElementById('boxplot').getContext('2d');
let boxplot = new Chart(boxplotctx,{
    type:'boxplot',
    data: {
        labels: ['0-24%', '25-49%', '50-74%', '75-100%'],
        datasets: [
            {

                data: [ [],[],[],[]],
                backgroundColor: [
                    'rgba(244, 244, 244, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(251, 191, 38, 0.8)',
                    'rgba(248, 78, 115, 0.8)',
                ],
                borderColor: 'white',
                borderWidth: '1',
                outlierColor: 'white'
            }
        ]
    },
    
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: false,
                labels: {
                    color:'white'
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Percentage Range of True Value',
                    color: 'white',
                },
                ticks: {color: 'white'}
            },
            y: { 
                title: {
                    display: true,
                    text: 'Absolute Error',
                    color: 'white'
                },
                ticks: {color: 'white'}
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
    let boxplots = [[],[],[],[]];
    for(let i = 0; i < chart_values.length; i++){
        scatter_data.push({x: chart_values[i][3], y: chart_values[i][4]});
        
        let trueval = chart_values[i][3];
        if( 0 <= trueval && trueval < 25) boxplots[0].push(chart_values[i][0]);
        if( 25 <= trueval && trueval < 50) boxplots[1].push(chart_values[i][0]);
        if( 50 <= trueval && trueval < 75) boxplots[2].push(chart_values[i][0]);
        if( 75 <= trueval && trueval <= 100) boxplots[3].push(chart_values[i][0]);
    }

    scatterPlot.data.datasets[0].data = scatter_data;

    scatterPlot.update();

    boxplot.data.datasets[0].data = boxplots;
    boxplot.update();
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

function calculateValues(){
    let sum_error = 0;
    for(let i = 0; i < chart_values.length; i++){
        sum_error += chart_values[i][0];
    }

    mean_absolute_error = (sum_error / chart_values.length).toFixed(2);

    const squareDifference = chart_values.map(row => (Number(row[0])- mean_absolute_error) ** 2);
    const variance = squareDifference.reduce((sum,value) => sum + value, 0) / chart_values.length;
    standard_deviation = Math.sqrt(variance).toFixed(2); 

    mean_error_p.textContent = ('Mean Absolute Error: ' + mean_absolute_error);
    stddev_p.textContent = ('Standard Deviation: ' + standard_deviation);
    
}

async function initialiseValues(){ 
    previous_values = await window.electron.readFile();
    chart_values = previous_values.slice();
    
    console.log("CHART VALUES HERE");
    console.log(chart_values);
    
    calculateValues();
    updateGraphs();
    console.log("recalculated values");
}

function generateBarValue(){
    random_val = Math.floor(Math.random() * 100) + 1;
    const bar = document.getElementById("estimate-bar");
    bar.value = random_val;
}


async function handleClick(event){
    event.preventDefault();
    const form = document.getElementById("form-text");
    const error_p = document.getElementById("error-message");
    let num = form.value
    
    num = num.replace('%', '');

    let parsed_num = Number(num);

    if( (num.trim() === '') || (Number.isNaN(parsed_num)) || !Number.isInteger(parsed_num) ||  (parsed_num < 0)){
        error_p.classList.remove("hidden");
        form.value = "";
        return;
    }

        
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
    
    prev_guess_p.textContent = "Prev Guess: " + parsed_num.toFixed(2);
    prev_true_p.textContent = "Prev True Value: " + random_val.toFixed(2);
    prev_error_p.textContent = "Absolute Error: " + abs_error.toFixed(2);

    calculateValues();
    generateBarValue();
    updateGraphs();
}