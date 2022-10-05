import React, { useState,useRef} from 'react'
import axios from 'axios'
import {useNavigate} from "react-router-dom"
import { Toast } from 'primereact/toast'; 
import { Messages } from 'primereact/messages';
import {CirclesWithBar} from  'react-loader-spinner'
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import styles from "./SalesModelBuilder.module.css"
import 'primeicons/primeicons.css';

import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';

function SalesModelBuilder() { 
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

    // ARIMA Model Builder 

    let [ARIMACol,SetARIMACol] = useState("")
    let [ARIMAP,SetARIMAP] = useState("")
    let [ARIMAD,SetARIMAD] = useState("")
    let [ARIMAQ,SetARIMAQ] = useState("")
    let [ARIMALoader,SetARIMALoader] = useState(false)
    let [ARIMAImg,SetARIMAImg] = useState(null)
    let [ARIMASummary,SetARIMASummary] = useState("")
    let [ARIMAResiduals,SetARIMAResiduals] = useState("")
    let [ARIMABRAINImg,SetARIMABRAINImg] = useState(null) 

    // SARIMA Model Builder 

    
    let [SARIMACol,SetSARIMACol] = useState("")
    let [SARIMAP,SetSARIMAP] = useState("")
    let [SARIMAD,SetSARIMAD] = useState("")
    let [SARIMAQ,SetSARIMAQ] = useState("")
    let [SARIMALoader,SetSARIMALoader] = useState(false)
    let [SARIMAImg,SetSARIMAImg] = useState(null)
    let [SARIMASummary,SetSARIMASummary] = useState("")
    let [SARIMAAdvImg,SetSARIMAAdvImg] = useState(null) 

    // AutoRegressive Model Builder 

    let [ARCol,SetARCol] = useState("")
    let [ARP,SetARP] = useState("")
    let [ARLoader,SetARLoader] = useState(false)
    let [ARImg,SetARImg] = useState(null)
    let [ARSummary,SetARSummary] = useState("")

    

    // Column Initializer 

    let TargetColumn = ["Sales_Dollars","Quantity"]
    let P = []
    let D = []
    let Q = [] 

    for(var decimal = 1;decimal<=20;decimal++){
        
            P.push(decimal) 
            Q.push(decimal)
            D.push(decimal-1)
    }
    
    D.push(20)
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
          let pdf = new jspdf.jsPDF('p', 'mm', 'a1');
          var position = 5;
          pdf.addImage(contentDataURL, 'PNG', 5, position, imgWidth-7, imgHeight)
          pdf.save('Digitech_Sales_Model_Bulder.pdf');
         })

         document.getElementById("downloadbtn").style.visibility = "visible";
         document.getElementById("homebtn").style.visibility = "hidden";
 

      } 

    
    // ARIMA Model Builder
    function ARIMABuilder(){

        if(ARIMACol==="" || ARIMAP==="" || ARIMAD===""||ARIMAQ===""){
            toast.current.show({severity: 'error', summary: 'Error while Building a Modle', detail: 'please select a values'});
            msgs1.current.show({severity: 'error', summary: 'Empty Value found',detail: 'Please select date and column'});  
          
            return ; 
        }

        else{

            toast.current.show({severity: 'info', summary: 'Loading ...', detail: 'please wait'});
            msgs1.current.show({severity: 'success', summary: 'ARIMA Model Builder Starting',detail: 'Builder Starting'}); 
            
            SetARIMALoader(true)

            let ARIMAForm = new FormData()
            ARIMAForm.append("target",ARIMACol)
            ARIMAForm.append("p",parseFloat(ARIMAP))
            ARIMAForm.append("d",parseFloat(ARIMAD))
            ARIMAForm.append("q",parseFloat(ARIMAQ))
            axios.post("http://localhost:5000/arimabuilder",ARIMAForm,config).then((resp)=>{ 

            SetARIMALoader(false)
            console.log(resp.data); 
            SetARIMASummary(resp.data["summary"])
            SetARIMAResiduals(resp.data["resid"])
            SetARIMAImg(resp.data["ARIMA"])
            SetARIMABRAINImg(resp.data["ARIMABR"])
            toast.current.show({severity: 'info', summary: 'Sales data on particular range', detail: 'Data Found'});
            msgs1.current.show({severity: 'success', summary: 'Sales data on particular range',detail: 'ARIMA Model builder has been built '}); 

        }).catch((err)=>{
            SetARIMALoader(false); 
            console.log(err)
            toast.current.show({severity: 'error', summary: 'error while fetching Sales data on particular range', detail: 'Data Not Found'});
            msgs1.current.show({severity: 'error', summary: 'error while fetching Sales data on particular range',detail: 'ARIMA MODEL FAILED'}); 

        })
        }

        
          
    }
    

     // SARIMA Model Builder
     function SARIMABuilder(){

        if(SARIMACol==="" || SARIMAP==="" || SARIMAD===""|| SARIMAQ===""){
            toast.current.show({severity: 'error', summary: 'Error while Building a Model', detail: 'please select a values'});
            msgs1.current.show({severity: 'error', summary: 'Empty Value found',detail: 'Please select date and column'});  
          
            return ; 
        }

        else{

            toast.current.show({severity: 'info', summary: 'Loading ...', detail: 'please wait'});
            msgs1.current.show({severity: 'success', summary: 'SARIMA Model Builder Starting',detail: 'Builder Starting'}); 
            
            SetSARIMALoader(true)

            let SARIMAForm = new FormData()
            SARIMAForm.append("target",SARIMACol)
            SARIMAForm.append("p",parseFloat(SARIMAP))
            SARIMAForm.append("d",parseFloat(SARIMAD))
            SARIMAForm.append("q",parseFloat(SARIMAQ))
            axios.post("http://localhost:5000/sarimabuilder",SARIMAForm,config).then((resp)=>{ 

            SetSARIMALoader(false)
            console.log(resp.data); 
            SetSARIMASummary(resp.data["summary"])
          
            SetSARIMAImg(resp.data["SARIMA"])
            SetSARIMAAdvImg(resp.data["SARIMAADV"])
            toast.current.show({severity: 'info', summary: 'SARIMA Model has been built successfully', detail: 'Data Found'});
            msgs1.current.show({severity: 'success', summary: 'Sales data on particular range',detail: 'Model built End '}); 

        }).catch((err)=>{
            SetARIMALoader(false); 
            console.log(err)
            toast.current.show({severity: 'error', summary: 'error while building SARIMA Model', detail: 'Data Not Found'});
            msgs1.current.show({severity: 'error', summary: 'error while building SARIMA Model',detail: 'SARIMA Model Error occurs '}); 

        })
        }

        
          
    } 


     // Auto Regressive Model Builder
     function ARBuilder(){

        if(ARCol==="" || ARP===""){
            toast.current.show({severity: 'error', summary: 'Error while Building a Model', detail: 'please select a values'});
            msgs1.current.show({severity: 'error', summary: 'Empty Value found',detail: 'Please select date and column'});  
          
            return ; 
        }

        else{

            toast.current.show({severity: 'info', summary: 'Loading ...', detail: 'please wait'});
            msgs1.current.show({severity: 'success', summary: 'Auto Regressive Model Builder Starting',detail: 'Builder Starting'}); 
            
            SetARLoader(true)

            let ARForm = new FormData()
            ARForm.append("target",ARCol)
            ARForm.append("p",parseFloat(ARP))
            
            axios.post("http://localhost:5000/armodel",ARForm,config).then((resp)=>{ 

            SetARLoader(false)
            console.log(resp.data); 
            SetARSummary(resp.data["summary"])
            
            SetARImg(resp.data["AR"])
            
            toast.current.show({severity: 'info', summary: 'data on particular range', detail: 'Data Found'});
            msgs1.current.show({severity: 'success', summary: 'data on particular range',detail: 'AR Model Start '}); 

        }).catch((err)=>{
            SetARLoader(false); 
            console.log(err)
            toast.current.show({severity: 'error', summary: 'error while building Model', detail: 'Data Not Found'});
            msgs1.current.show({severity: 'error', summary: 'error while building Model',detail: 'AR Model error occurs and process End '}); 

        })
        }

        
          
    }
    
  // Home Navigator 

  function HomeNavigator(){
    navigate("/dashboard")
  }
 

  return (
    <div className={`${styles.smmodel}`} id="print">
       <div className={`${styles.smdiv}`}>
         <h3 className={`${styles.smdivhead}  text-center card-header`}>Sales Forecasting Model Builder.</h3>
         <button className='btn btn-warning' onClick={ExportPDF} id="downloadbtn">Download</button> 
         <button className='btn btn-dark' onClick={HomeNavigator} id="homebtn">Back to Home</button>
       </div> 

       <div className={`${styles.ARIMA}`}>
          <h3 className={`${styles.ARIMAhead} card-header text-center`}>ARIMA (Auto Regressive Integrator Moving Average)</h3>
          <h4 className={`${styles.ARIMAhead} card-header text-center`}>Tune your model below.</h4>
          <Toast ref={toast}></Toast>
          <Messages ref={msgs1} /> 
          <Dropdown value={ARIMACol} options={TargetColumn} onChange={(e) => SetARIMACol(e.value)} className={`bg-light ${styles.dropper}`} placeholder="select a Model Target"/> 
          <Dropdown value={ARIMAP} options={P} onChange={(e) => SetARIMAP(e.value)} className={`bg-light ${styles.dropper}`} placeholder="select a Partial Correlation (P)"/> 
          <Dropdown value={ARIMAD} options={D} onChange={(e) => SetARIMAD(e.value)} className={`bg-light ${styles.dropper}`} placeholder="select a Differentiator (D)"/> 
          <Dropdown value={ARIMAQ} options={Q} onChange={(e) => SetARIMAQ(e.value)} className={`bg-light ${styles.dropper}`} placeholder="select a Auto Partial Correlation (Q)"/> 
          <Button label="Submit" icon="pi pi-check" iconPos="right" onClick={ARIMABuilder} className={`${styles.dropper}`} />
          
       </div> 

       <div className={`${styles.ARIMAReport}`}>
          <CirclesWithBar height="100" width="100" color="cyan" wrapperStyle={{}} wrapperClass="" visible={ARIMALoader} outerCircleColor=""/>  
         { 
          ARIMASummary!==""?
          <div className={`${styles.ARIMAsumdiv}`}>
              <h4 className={`text-center card-header ${styles.arimasum}`}>Model Summary</h4> 
              <p className='bg-light card-header fw-bold'>{ARIMASummary}</p> 
          </div> : null 
         }

         {
            ARIMAResiduals!==""? 
            <div className={`${styles.ARIMAresiddiv} card-header`}>
              <h4 className={`text-center card-header ${styles.arimaresid}`}>Model Residual Loss Graph</h4> 
              <img src={`data:image/png;base64,${ARIMAResiduals}`} alt='ARIMA Residuals Graph' className={``}></img>
            </div> 
          : null 

         }

         {
            ARIMAImg!==null? 
            <div className={`${styles.ARIMAresiddiv} card-header`}>
              <h4 className={`text-center card-header ${styles.arimaresid}`}>ARIMA Tuned Model Graph</h4> 
              <img src={`data:image/png;base64,${ARIMAImg}`} alt='ARIMA Tuned Model Graph' className={``}></img>
            </div> 
          : null 

         }

         {
            ARIMABRAINImg!==null? 
            <div className={`${styles.ARIMAresiddiv} card-header`}>
              <h4 className={`text-center card-header ${styles.arimaresid}`}>Auto ARIMA Model Graph</h4> 
              <img src={`data:image/png;base64,${ARIMABRAINImg}`} alt='ARIMA Auto Tuned Model Graph' className={``}></img>
            </div> 
          : null 

         }


       </div> 

       





       <div className={`${styles.ARIMA}`}>
          <h3 className={`${styles.ARIMAhead} card-header text-center`}>SARIMA (Seasonal Auto Regressive Integrator Moving Average)</h3>
          <h4 className={`${styles.ARIMAhead} card-header text-center`}>Tune your model below.</h4>
          <Toast ref={toast}></Toast>
          <Messages ref={msgs1} /> 
          <Dropdown value={SARIMACol} options={TargetColumn} onChange={(e) => SetSARIMACol(e.value)} className={`bg-light ${styles.dropper}`} placeholder="select a Model Target"/> 
          <Dropdown value={SARIMAP} options={P} onChange={(e) => SetSARIMAP(e.value)} className={`bg-light ${styles.dropper}`} placeholder="select a Partial Correlation (P)"/> 
          <Dropdown value={SARIMAD} options={D} onChange={(e) => SetSARIMAD(e.value)} className={`bg-light ${styles.dropper}`} placeholder="select a Differentiator (D)"/> 
          <Dropdown value={SARIMAQ} options={Q} onChange={(e) => SetSARIMAQ(e.value)} className={`bg-light ${styles.dropper}`} placeholder="select a Auto Partial Correlation (Q)"/> 
          <Button label="Submit" icon="pi pi-check" iconPos="right" onClick={SARIMABuilder} className={`${styles.dropper}`} />
          
       </div> 

       <div className={`${styles.ARIMAReport}`}>
          <CirclesWithBar height="100" width="100" color="cyan" wrapperStyle={{}} wrapperClass="" visible={SARIMALoader} outerCircleColor=""/>  
         { 
          SARIMASummary!==""?
          <div className={`${styles.ARIMAsumdiv}`}>
              <h4 className={`text-center card-header ${styles.arimasum}`}>SARIMA Model Summary</h4> 
              <p className='bg-light card-header fw-bold'>{SARIMASummary}</p> 
          </div> : null 
         }

        

         {
            SARIMAImg!==null? 
            <div className={`${styles.ARIMAresiddiv} card-header`}>
              <h4 className={`text-center card-header ${styles.arimaresid}`}>SARIMA Tuned Model Graph</h4> 
              <img src={`data:image/png;base64,${SARIMAImg}`} alt='SARIMA Tuned Model Graph' className={``}></img>
            </div> 
          : null 

         }

         {
            SARIMAAdvImg!==null? 
            <div className={`${styles.ARIMAresiddiv} card-header`}>
              <h4 className={`text-center card-header ${styles.arimaresid}`}>SARIMA Seasonal Graph</h4> 
              <img src={`data:image/png;base64,${SARIMAAdvImg}`} alt='SARIMA Seasonal  Graph' className={``}></img>
            </div> 
          : null 

         }


       </div> 



        <div className={`${styles.ARIMA}`}>
            <h3 className={`${styles.ARIMAhead} card-header text-center`}>AR (Auto Regressive Model)</h3>
            <h4 className={`${styles.ARIMAhead} card-header text-center`}>Tune your model below.</h4>
            <Toast ref={toast}></Toast>
            <Messages ref={msgs1} /> 
            <Dropdown value={ARCol} options={TargetColumn} onChange={(e) => SetARCol(e.value)} className={`bg-light ${styles.dropper}`} placeholder="select a Model Target"/> 
            <Dropdown value={ARP} options={P} onChange={(e) => SetARP(e.value)} className={`bg-light ${styles.dropper}`} placeholder="select a Partial Correlation (P)"/> 
           
            <Button label="Submit" icon="pi pi-check" iconPos="right" onClick={ARBuilder} className={`${styles.dropper}`} />
       
        </div> 






    <div className={`${styles.ARIMAReport}`}>
       <CirclesWithBar height="100" width="100" color="cyan" wrapperStyle={{}} wrapperClass="" visible={ARLoader} outerCircleColor=""/>  
      { 
       ARSummary!==""?
       <div className={`${styles.ARIMAsumdiv}`}>
           <h4 className={`text-center card-header ${styles.arimasum}`}>Auto Regressive  Model Summary</h4> 
           <p className='bg-light card-header fw-bold'>{ARSummary}</p> 
       </div> : null 
      }

     

      {
         ARImg!==null? 
         <div className={`${styles.ARIMAresiddiv} card-header`}>
           <h4 className={`text-center card-header ${styles.arimaresid}`}>Auto Regressive Tuned Model Graph</h4> 
           <img src={`data:image/png;base64,${ARImg}`} alt='AR Tuned Model Graph' className={``}></img>
         </div> 
       : null 

      }

      

    </div>


    <div>
       <h3 className={`${styles.copyright} text-center card-footer`}>Digiverz KAAR Techologies Pvt Limited CopyRight @ {" " +copyright}</h3>
    </div>

    </div>
  )
}

export default SalesModelBuilder