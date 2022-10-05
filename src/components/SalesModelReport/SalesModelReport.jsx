import React, { useState,useRef} from 'react'
import axios from 'axios'
import {useNavigate} from "react-router-dom"
import { Toast } from 'primereact/toast'; 
import { Messages } from 'primereact/messages';
import styles from "./SalesModelReport.module.css"
import 'primeicons/primeicons.css';

import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';


function SalesModelReport() { 

    const navigate = useNavigate() 
    
    const toast = useRef(null)
    const msgs1 = useRef(null);  
    const token = localStorage.getItem("token") 
    let [username,setUsername] = useState("")   
    let copyright = new Date().getFullYear()  

   
    // Model ADF Report 

    let [ADFStats,SetADFStats] = useState("")
    let [PValue,SetPValue] = useState("")
    let [ADFReport,SetADFReport] = useState("")

    // ACF 

    let [ACF,SetACF] = useState(null)
    let [PACF,SetPACF] = useState(null)

    // Seasonality Test 
    let [SeasonStats,SetSeasonStats] = useState("")
    let [SeasonPValue,SetSeasonPValue] = useState("")
    let [SeasonADFReport,SetSeasonADFReport] = useState("")
    let [SeasonReport,SetSeasonReport] = useState("") 

    // Token Authentication 

    React.useEffect(() => { 


        const  tokenAuth = ()=>{
        axios.defaults.baseURL = 'http://localhost:5000';
        axios.defaults.headers.post['Content-Type'] ='multipart/form-data'
        axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
        axios.defaults.headers.common = {'Authorization': `bearer ${token}`} 
        axios.post("http://localhost:5000/Authorization",{}).then((response) => {
          console.log(response.data); 
          setUsername(response.data["username"])
          console.log(username)
          if(response.data.Code === "404"){
            toast.current.show({severity: 'error', summary: 'Authentication Error', detail: 'UnAuthorized User'});
            msgs1.current.show({severity: 'error', summary: 'Authentication Error',detail: 'UnAuthorized User'});  
  
            setInterval(()=>{
              navigate("/login");
            },100); 
  
         
          }
         
        }).catch((err)=>{
          console.log(err); 
          toast.current.show({severity: 'error', summary: 'Error while Authentication', detail: 'Error while Authentication Process'});
          msgs1.current.show({severity: 'error', summary: 'Error while Authentication',detail: 'Error while Authentication'});  
          
          navigate("/login")
         
        })
      };
      
      tokenAuth();
      },[token,navigate,username]); 


      React.useEffect(()=>{
        
        // Getting Sales Graphs 
    
        axios.get("http://localhost:5000/adftest").then((resp)=>{
            console.log(resp.data); 
            SetADFStats(resp.data["adfstats"])
            SetPValue(resp.data["p"])
            SetADFReport(resp.data["result"])
        }).catch((err)=>{
            console.log(err); 
              toast.current.show({severity: 'error', summary: 'Error while Doing ADF Test', detail: 'Error while Getting ADF report'});
              msgs1.current.show({severity: 'error', summary: 'Error while Getting Sales Graph',detail: 'Error while Getting ADF Report'});  
              
        })
        
          },[]) 



    React.useEffect(()=>{
        
            // Getting Sales Graphs 
        
            axios.get("http://localhost:5000/arimapq").then((resp)=>{
                console.log(resp.data); 
                SetACF(resp.data["acf"])
                SetPACF(resp.data["pacf"])
                
            }).catch((err)=>{
                console.log(err); 
                  toast.current.show({severity: 'error', summary: 'Error while Getting partial correlation', detail: 'Error while Getting Partial Correlation'});
                  msgs1.current.show({severity: 'error', summary: 'Error while Getting auto partial correlation',detail: 'Error while Getting Auto Partial Correlation'});  
                  
            })
            
              },[]) 


        React.useEffect(()=>{
        
                // Getting Sales Graphs 
            
                axios.get("http://localhost:5000/seasonalitytest").then((resp)=>{
                    console.log(resp.data); 
                    SetSeasonStats(resp.data["adfstats"])
                    SetSeasonPValue(resp.data["p"])
                    SetSeasonADFReport(resp.data["result"]) 
                    SetSeasonReport(resp.data["sres"])
                }).catch((err)=>{
                    console.log(err); 
                      toast.current.show({severity: 'error', summary: 'Error while Doing Season ADF Test', detail: 'Error while Getting Season ADF report'});
                      msgs1.current.show({severity: 'error', summary: 'Error while Getting Season ADf Graph',detail: 'Error while Getting Season ADF Report'});  
                      
                })
                
                  },[]) 
        
    
        // Export PDF 
    
        function ExportPDF(){
            var print = document.getElementById('print');
            //var width = document.getElementById('print').offsetWidth; 
            document.getElementById("downloadbtn").style.visibility = "hidden";
            html2canvas(print).then(canvas => {
              var imgWidth = 208;
              var imgHeight = canvas.height * imgWidth / canvas.width;
              const contentDataURL = canvas.toDataURL('image/png')
              let pdf = new jspdf.jsPDF('p', 'mm', 'a4');
              var position = 5;
              pdf.addImage(contentDataURL, 'PNG', 5, position, imgWidth-7, imgHeight)
              pdf.save('Digitech_TimeSeriesModel_Analysis.pdf');
             }) 
             document.getElementById("downloadbtn").style.visibility = "visible";
          } 
  
   // Home Navigator 

   function HomeNavigator(){
    navigate("/dashboard")
  }



  return (
    <div className={`${styles.sm}`} id="print">
        
        <Toast ref={toast}></Toast>
        <Messages ref={msgs1} /> 
        <div className={`${styles.smdiv} card-footer `}>
            <h2 className={`${styles.smheader} card-header text-center`}>Digiverz Sales Forecasting Model Report</h2> 
            <button className='btn btn-warning' onClick={ExportPDF} id="downloadbtn">Download</button>
            <button className='btn btn-dark' onClick={HomeNavigator} id="homebtn">Back to Home</button>
        </div> 

        <div className={`${styles.adf}`}>
           <h3 className={`${styles.adfhead} `}>ADF (Augmented Dickey Fuller Test Report) </h3>
           <h4 className={`${styles.adfbod} card-footer`}>ADF Statistics : {ADFStats}</h4>
           <h4 className={`${styles.adfbod} card-footer`}>P Value : {PValue}</h4>
           <h4 className={`${styles.adfbod} card-footer bg-dark text-white text-center`}>ADF Result : {ADFReport}</h4>

        </div> 

        <div className={`${styles.pacf}`}>
           <h3 className={`card-header text-center`}> Partial Auto Correlation Analysis (PACF) in ARIMA Model. 'P'. </h3> 
           <img src={`data:image/png;base64,${PACF}`}alt='PACFgraph' className={``}></img>
        </div> 

        <div className={`${styles.pacf}`}>
            <h3 className={`card-header text-center`}> Auto Correlation Analysis (ACF) in ARIMA Model. 'Q'. </h3> 
            <img src={`data:image/png;base64,${ACF}`}alt='ACFgraph' className={``}></img>
        </div> 

        <div className={`${styles.adf}`}>
           <h3 className={`${styles.adfhead}`}>(Seasonality Test Report) </h3>
           <h4 className={`${styles.adfbod} card-footer`}>Seasonality ADF Statistics : {SeasonStats}</h4>
           <h4 className={`${styles.adfbod} card-footer`}>Seasonality P Value : {SeasonPValue}</h4>
           <h4 className={`${styles.adfbod} card-footer`}>Seasonality ADF Result : {SeasonADFReport}</h4>
           <h4 className={`${styles.adfbod} card-footer bg-dark text-white text-center`}>Seasonality  Result : {SeasonReport}</h4>

        </div> 

        <div>
        <h3 className={`${styles.copyright} text-center card-footer`}>Digiverz KAAR Techologies Pvt Limited CopyRight @ {" " +copyright}</h3>
      </div>

    </div>
  )
}

export default SalesModelReport