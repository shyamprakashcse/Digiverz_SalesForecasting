import React, { useState,useRef} from 'react'
import axios from 'axios'
import {useNavigate} from "react-router-dom"
import { Toast } from 'primereact/toast'; 
import { Messages } from 'primereact/messages';
import {CirclesWithBar} from  'react-loader-spinner'
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import styles from "./SalesForcastBrain.module.css"
import 'primeicons/primeicons.css';

import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';

function SalesForcastBrain() { 

    const navigate = useNavigate()
    const config = {
        headers: {
          'content-type': 'multipart/form-data',
          
        },
      };
    const toast = useRef(null)
    const msgs1 = useRef(null);  
    const token = localStorage.getItem("token") 
    let [username,setUsername] = useState("")   
    let copyright = new Date().getFullYear() 

    // Forecast Initializer 

    let [Model,SetModel] = useState("")
    let [StartDate,SetStartDate] = useState("")
    let [EndDate,SetEndDate] = useState("")
    let [ModelLoader,SetModelLoader] = useState(false)
    let [ForecastImg,SetForecastImg] = useState(null) 

    let modeldrop = ["ARIMA","SARIMA","AR","ALL"]









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

     // Export PDF 

     function ExportPDF(){
        var print = document.getElementById('print');
        // var width = document.getElementById('print').offsetWidth;
        document.getElementById("downloadbtn").style.visibility = "hidden";
        document.getElementById("homebtn").style.visibility = "hidden";


        html2canvas(print).then(canvas => {
          var imgWidth = 208;
          var imgHeight = canvas.height * imgWidth / canvas.width;
          const contentDataURL = canvas.toDataURL('image/png')
          let pdf = new jspdf.jsPDF('p', 'mm', 'a4');
          var position = 5;
          pdf.addImage(contentDataURL, 'PNG', 5, position, imgWidth-7, imgHeight) 
          let filename = "Digitech_SalesForecast "+StartDate.getFullYear().toString()+"-"+EndDate.getFullYear().toString()+".pdf"
        //   pdf.save('Digitech_SalesForecast.pdf'); 
        pdf.save(filename)
         })

         document.getElementById("downloadbtn").style.visibility = "visible"; 
         document.getElementById("homebtn").style.visibility = "hidden";


      } 

    

    // Save Sales Forecaster Report 

    function SaveSFReport(){  

      if(Model === "" || StartDate === "" || EndDate === ""){
        
        toast.current.show({severity: 'error', summary: 'Error while saving the report', detail: 'Saved Report failed'});
        msgs1.current.show({severity: 'error', summary: 'empty values found',detail: 'Please perform forecasting'}); 
        return ; 

      }
    
      let SFReport = {
        "username":username, 
        "brain":Model, 
        "startdate":StartDate, 
        "enddate":EndDate, 
        "sfimg":ForecastImg
      }
      console.log(SFReport)
      let ReportFormData = new FormData()
      ReportFormData.append("sfreport",JSON.stringify(SFReport))
      ReportFormData.append("username",username)

      axios.post("http://localhost:5000/savesfreport",ReportFormData,config).then((resp)=>{
               
                console.log(resp.data)
               
                toast.current.show({severity: 'info', summary: 'Saving Report has been done successfully', detail: 'Report Saved'});
                msgs1.current.show({severity: 'success', summary: 'Report Saved has been done successfully',detail: 'Forecast Report has been saved'}); 

            }).catch((err)=>{
                
                console.log(err)
                toast.current.show({severity: 'error', summary: 'Error while saving the report', detail: 'Saved Report failed'});
                msgs1.current.show({severity: 'error', summary: 'error while saving the report',detail: 'Error occurs while saving'}); 

            })

    }
  



    // forecaster 
    function Forecast(){

        if(StartDate === "" || EndDate === "" || Model===""){
            toast.current.show({severity: 'error', summary: 'Error while Submitting the forecast models', detail: 'please select a values'});
            msgs1.current.show({severity: 'error', summary: 'Empty Value found',detail: 'Please select date and models'});  
          
            return ; 

        } 
        else{
            toast.current.show({severity: 'info', summary: 'Loading ...', detail: 'please wait'});
            msgs1.current.show({severity: 'success', summary: 'Forecast Starting',detail: 'Time Series Model process starting'}); 
            
            let sd = ""
            let ed = "" 

            if(StartDate.getFullYear()>EndDate.getFullYear()){
                toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                return ;
            }
             
            else if(StartDate.getFullYear() === EndDate.getFullYear()){

                if(StartDate.getMonth()+1 > EndDate.getMonth()+1){
                    toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                    msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                    return ;
                }
                else if(StartDate.getMonth()+1 === EndDate.getMonth()+1){
                    if(StartDate.getDate()>EndDate.getDate()){
                        toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                        msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                        return ;
                    }
                }


            }


            let sdy = StartDate.getFullYear().toString()
            let sdm = (StartDate.getMonth()+1).toString()
            let sdd = StartDate.getDate().toString()   

            let edy = EndDate.getFullYear().toString()
            let edm = (EndDate.getMonth()+1).toString()
            let edd = EndDate.getDate().toString() 


            sdm = sdm.padStart(2,'0')
            sdd = sdd.padStart(2,'0')

            edm = edm.padStart(2,'0')
            edd = edd.padStart(2,'0')

            sd+=sdy+"-"+sdm+"-"+sdd 
            ed+=edy+"-"+edm+"-"+edd  

            
            console.log(sd)
            console.log(ed)

            let ForecastFormData = new FormData()
            ForecastFormData.append("brain",Model)
            ForecastFormData.append("sd",sd)
            ForecastFormData.append("ed",ed) 
            SetModelLoader(true)
            
            axios.post("http://localhost:5000/forcast",ForecastFormData,config).then((resp)=>{
                SetModelLoader(false)
                SetForecastImg(resp.data["res"])
               
                toast.current.show({severity: 'info', summary: 'Forecast has been done successfully', detail: 'Data Found'});
                msgs1.current.show({severity: 'success', summary: 'Forecast has been done successfully',detail: 'Forecast Model End '}); 

            }).catch((err)=>{
                SetModelLoader(false); 
                console.log(err)
                toast.current.show({severity: 'error', summary: 'error while forecasting ', detail: 'Data Not Found'});
                msgs1.current.show({severity: 'error', summary: 'error while forecasting',detail: 'Model building Error. process End '}); 

            })
              
            
      
        }

    }

  // Home Navigation 

  function HomeNavigator(){
    navigate("/dashboard")
  }


  return ( 

    <div className={`${styles.model}`} id="print">

       <div className={`${styles.modelnav} card-header`}>
          <h3 className={`${styles.modelnavhead} card-header text-center`}>Sales Forecaster.</h3>
      
          <button className='btn btn-warning' id="downloadbtn" onClick={ExportPDF}>Download</button> 
          <button className='btn btn-dark' id="homebtn" onClick={HomeNavigator}>Back to Home</button>
          <button className='btn btn-dark' onClick={SaveSFReport}>Save Forecast</button> 
       </div>

       <h2 className={`card-header ${styles.slogan}`}>Time Travel with our Models and Forecast your sales data</h2>
       <div className={`${styles.inputfeeder} card-header`}>
           
           <Dropdown value={Model} options={modeldrop} onChange={(e) => SetModel(e.value)} className={`${styles.saleszoomdrop} bg-light text-black`} placeholder="Select a Forecasting Algorithm"/> 
           <Calendar dateFormat="dd/mm/yy"  placeholder="Start Date" value={StartDate} onChange={(e) => SetStartDate(e.value)} className={`${styles.saleszoomcal}`} showIcon></Calendar> 
           <Calendar dateFormat="dd/mm/yy"  placeholder="End Date" value={EndDate} onChange={(e) => SetEndDate(e.value)}  className={`${styles.saleszoomcal}`} showIcon></Calendar>  
           <Button label="Submit" icon="pi pi-check" iconPos="right"  onClick={Forecast} className={`${styles.saleszoomcal}`} />
       
       </div>  

       <div className={`${styles.forecast} card-header`}>
       <Toast ref={toast}></Toast>
       <Messages ref={msgs1} /> 
       <CirclesWithBar height="100" width="100" color="cyan" wrapperStyle={{}} wrapperClass="" visible={ModelLoader} outerCircleColor=""/>
       {
         ForecastImg !== null ?  <img src={`data:image/png;base64,${ForecastImg}`} alt='forecast' className={``}></img> : null  
       }
       
       </div>


       <div>
           <h3 className={`${styles.copyright} text-center card-footer`}>Digiverz KAAR Techologies Pvt Limited CopyRight @ {" " +copyright}</h3>
       </div>

   
    </div>
  )
}

export default SalesForcastBrain