//Clears the browsers local storage
//Should be triggered at the end of an experiment after logs have been downloaded or at the start of an experiment
export default function ClearEventStorage(){
    localStorage.removeItem('eventLog');
}