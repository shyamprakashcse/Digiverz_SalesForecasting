import React, { useState,useRef} from 'react'
import axios from 'axios'
import {useNavigate} from "react-router-dom"
import { Toast } from 'primereact/toast'; 
import { Messages } from 'primereact/messages';
import {CirclesWithBar} from  'react-loader-spinner'
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import styles from "./SalesForecast.module.css"
import 'primeicons/primeicons.css';

import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';



function SalesForecast() { 

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

    // ZoomLoader Initialization 
    let [ZoomLoader,SetZoomLoader] = useState(false);  
    let [ZoomImg,SetZoomImg] = useState(null)
    let [ZoomImgVisible,SetZoomImgVisible] = useState(false) 
    let [ZoomColDrop,SetZoomColDrop] = useState("")
    let [ZoomStartDate,SetZoomStartDate] = useState("")
    let [ZoomEndDate,SetZoomEndDate] = useState("")

    let MinDate = new Date(2009,10,1)
    let MaxDate = new Date(2015,9,1)


    // Sales Graph Initialization 

    let [SalesPlot,SetSalesPlot] = useState(null)
    let [QuantPlot,SetQuantPlot] = useState(null)
    let [DollPlot,SetDollPlot]  = useState(null)


    
   
    let TargetColumns = ["Sales_Dollars","Quantity"] 


   
    

    // Resampling Rules 
    let rules = {"C": "custom business day frequency (experimental)", "B": "business day frequency",
            "D": "calendar day frequency", "W": "weekly frequency", "M": "month end frequency",
            "SM": "semi-month end frequency (15th and end of month)", "BM": "business month end frequency",
            "CBM": "custom business month end frequency", "MS": "month start frequency",
            "SMS": "semi-month start frequency (1st and 15th)", "BMS": "business month start frequency",
            "CBMS": "custom business month start frequency", "Q": "quarter end frequency",
            "BQ": "business quarter end frequency", "QS": "quarter start frequency",
            "BQS": "business quarter start frequency", "A": "year end frequency", "BA": "business year end frequency",
            "BY": "business year end frequency", "AS": "year start frequency", "YS": "year start frequency",
            "BAS": "business year start frequency", "BYS": "business year start frequency",
            "BH": "business hour frequency", "H": "hourly frequency", "T": "minutely frequency",
            "min": "minutely frequency", "S": "secondly frequency", "L": "milliseconds", "ms": "milliseconds",
            "U": "microseconds", "us": "microseconds", "N": "nanoseconds"} 

    let aggregations = {"min":"minimum","max":"maximum","sum":"sum","count":"count","var":"variance","median":"median","first":"first","std":"standard deviation","mean":"mean"}
    

    let rulesKey = [] 
    let aggrKey = []
    

    for(var rukey in rules){
        rulesKey.push(rukey)
    }

    for(var agkey in aggregations){
        aggrKey.push(agkey)
    }

   

    let [RulesDrop,SetRulesDrop] = useState("")
    let [AggDrop,SetAggDrop] = useState("")
    let [SampleColDrop,SetSampleColDrop] = useState("")
    let [SampleStartDate,SetSampleStartDate] = useState("")
    let [SampleEndDate,SetSampleEndDate] = useState("")
    let [SampleLoader,SetSampleLoader] = useState(false) 
    let [SamplingImg,SetSamplingImg] = useState(null)
    let [SamplingImgVisible,SetSamplingImgVisible]= useState(false)
    
    
    // Moving Average 

    
    let [MovAggDrop,SetMovAggDrop] = useState("")
    let [MAStartDate,SetMAStartDate] = useState("")
    let [MAEndDate,SetMAEndDate] = useState("")
    let [MAColDrop,SetMAColDrop] = useState("")
    let [MALoader,SetMALoader] = useState(false) 
    let [MAImg,SetMAImg] = useState(null)
    let [MAImgVisible,SetMAImgVisible] = useState(false)


    // Cummulative Moving Average

    let [CMAColDrop,SetCMAColDrop] = useState("")
    let [CMAStartDate,SetCMAStartDate] = useState("")
    let [CMAEndDate,SetCMAEndDate] =  useState("")
    let [CMAAggDrop,SetCMAAggDrop] = useState("")
    let [CMALoader,SetCMALoader] = useState(false)
    let [CMAImg,SetCMAImg] = useState(null)
    let [CMAImgVisible,SetCMAImgVisible] = useState(false)  


    // Exponential weighted Moving Average 

    let [EWMAColDrop,SetEWMAColDrop] = useState("")
    let [EWMAStartDate,SetEWMAStartDate] = useState("")
    let [EWMAEndDate,SetEWMAEndDate] =  useState("")
    let [EWMAAggDrop,SetEWMAAggDrop] = useState("")
    let [EWMALoader,SetEWMALoader] = useState(false)
    let [EWMAImg,SetEWMAImg] = useState(null)
    let [EWMAImgVisible,SetEWMAImgVisible] = useState(false)  

    // Time Series Analyzer 

    let [TSAColDrop,SetTSAColDrop] = useState("")
    let [TSAStartDate,SetTSAStartDate] = useState("")
    let [TSAEndDate,SetTSAEndDate] = useState("")
    let [TSAAggDrop,SetTSAAggDrop] = useState("")
    let [TSALoader,SetTSALoader] = useState(false)
    let [TSAImg,SetTSAImg] = useState(null)
    let [TSAImgVisible,SetTSAImgVisible] = useState(false) 


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

    axios.get("http://localhost:5000/salesgraph").then((resp)=>{
        console.log(resp.data); 
        SetSalesPlot(resp.data["salesgraph"])
        SetDollPlot(resp.data["dollplot"])
        SetQuantPlot(resp.data["quantplot"])
    }).catch((err)=>{
        console.log(err); 
          toast.current.show({severity: 'error', summary: 'Error while Getting Sales Graph', detail: 'Error while Getting Sales Graph'});
          msgs1.current.show({severity: 'error', summary: 'Error while Getting Sales Graph',detail: 'Error while Getting Sales Graph'});  
          
    })
    
      },[]) 

    // Export PDF 

    function ExportPDF(){
        var print = document.getElementById('print');
        //var width = document.getElementById('print').offsetWidth;
        html2canvas(print).then(canvas => {
          var imgWidth = 208;
          var imgHeight = canvas.height * imgWidth / canvas.width;
          const contentDataURL = canvas.toDataURL('image/png')
          let pdf = new jspdf.jsPDF('p', 'mm', 'a1');
          var position = 5;
          pdf.addImage(contentDataURL, 'PNG', 5, position, imgWidth-7, imgHeight)
          pdf.save('Time_Series_Analysis.pdf');
         })
      } 
   
      // Sales Zoomer 

      function SalesZoomer(){
        if( ZoomColDrop === "" || ZoomStartDate === "" || ZoomEndDate === ""){
            toast.current.show({severity: 'error', summary: 'Error while Zoomer', detail: 'please select a values'});
            msgs1.current.show({severity: 'error', summary: 'Empty Value found',detail: 'Please select date and column'});  
          
            return ; 

        } 
        else{
            toast.current.show({severity: 'info', summary: 'Loading ...', detail: 'please wait'});
            msgs1.current.show({severity: 'success', summary: 'Zoom Picker Starting',detail: 'Zoom picker starting'}); 
            
            let sd = ""
            let ed = "" 

            if(ZoomStartDate.getFullYear()>ZoomEndDate.getFullYear()){
                toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                return ;
            }
             
            else if(ZoomStartDate.getFullYear() === ZoomEndDate.getFullYear()){

                if(ZoomStartDate.getMonth()+1 > ZoomEndDate.getMonth()+1){
                    toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                    msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                    return ;
                }
                else if(ZoomStartDate.getMonth()+1 === ZoomEndDate.getMonth()+1){
                    if(ZoomStartDate.getDate()>ZoomEndDate.getDate()){
                        toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                        msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                        return ;
                    }
                }


            }


            let sdy = ZoomStartDate.getFullYear().toString()
            let sdm = (ZoomStartDate.getMonth()+1).toString()
            let sdd = ZoomStartDate.getDate().toString()   

            let edy = ZoomEndDate.getFullYear().toString()
            let edm = (ZoomEndDate.getMonth()+1).toString()
            let edd = ZoomEndDate.getDate().toString() 


            sdm = sdm.padStart(2,'0')
            sdd = sdd.padStart(2,'0')

            edm = edm.padStart(2,'0')
            edd = edd.padStart(2,'0')

            sd+=sdy+"-"+sdm+"-"+sdd 
            ed+=edy+"-"+edm+"-"+edd  

            
            console.log(sd)
            console.log(ed)

            let ZoomFormData = new FormData()
            ZoomFormData.append("target",ZoomColDrop)
            ZoomFormData.append("sd",sd)
            ZoomFormData.append("ed",ed) 
            SetZoomLoader(true)
            
            axios.post("http://localhost:5000/saleszoomer",ZoomFormData,config).then((resp)=>{
                SetZoomLoader(false)
                SetZoomImg(resp.data["saleszoom"])
                SetZoomImgVisible(true)
                toast.current.show({severity: 'info', summary: 'Sales data on particular range', detail: 'Data Found'});
                msgs1.current.show({severity: 'success', summary: 'Sales data on particular range',detail: 'Zoom picker Start '}); 

            }).catch((err)=>{
                SetZoomLoader(false); 
                console.log(err)
                toast.current.show({severity: 'error', summary: 'error while fetching Sales data on particular range', detail: 'Data Not Found'});
                msgs1.current.show({severity: 'error', summary: 'error while fetching Sales data on particular range',detail: 'Zoom picker End '}); 

            })
              
            
      
        }
      }
      
    

     function Resampling(){
        
        if( SampleColDrop === "" || SampleStartDate === "" || SampleEndDate === "" || RulesDrop==="" || AggDrop===""){
            toast.current.show({severity: 'error', summary: 'Error while Resampling', detail: 'please select a values'});
            msgs1.current.show({severity: 'error', summary: 'Empty Value found',detail: 'Please select date and columns'});  
          
            return ; 

        } 
        else{
            toast.current.show({severity: 'info', summary: 'Loading ...', detail: 'please wait'});
            msgs1.current.show({severity: 'success', summary: 'Resampler Starting',detail: 'Resampling process starting'}); 
            
            let sd = ""
            let ed = "" 

            if(SampleStartDate.getFullYear()>SampleEndDate.getFullYear()){
                toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                return ;
            }
             
            else if(SampleStartDate.getFullYear() === SampleEndDate.getFullYear()){

                if(SampleStartDate.getMonth()+1 > SampleEndDate.getMonth()+1){
                    toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                    msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                    return ;
                }
                else if(SampleStartDate.getMonth()+1 === SampleEndDate.getMonth()+1){
                    if(SampleStartDate.getDate()>SampleEndDate.getDate()){
                        toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                        msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                        return ;
                    }
                }


            }


            let sdy = SampleStartDate.getFullYear().toString()
            let sdm = (SampleStartDate.getMonth()+1).toString()
            let sdd = SampleStartDate.getDate().toString()   

            let edy = SampleEndDate.getFullYear().toString()
            let edm = (SampleEndDate.getMonth()+1).toString()
            let edd = SampleEndDate.getDate().toString() 


            sdm = sdm.padStart(2,'0')
            sdd = sdd.padStart(2,'0')

            edm = edm.padStart(2,'0')
            edd = edd.padStart(2,'0')

            sd+=sdy+"-"+sdm+"-"+sdd 
            ed+=edy+"-"+edm+"-"+edd  

            
            console.log(sd)
            console.log(ed)

            let SampleFormData = new FormData()
            SampleFormData.append("target",SampleColDrop)
            SampleFormData.append("rule",RulesDrop)
            SampleFormData.append("agg",AggDrop)
            SampleFormData.append("sd",sd)
            SampleFormData.append("ed",ed) 
            SetSampleLoader(true)
            
            axios.post("http://localhost:5000/resampling",SampleFormData,config).then((resp)=>{
                SetSampleLoader(false)
                SetSamplingImg(resp.data["resampling"])
                SetSamplingImgVisible(true)
                toast.current.show({severity: 'info', summary: 'Sampling on particular range', detail: 'Data Found'});
                msgs1.current.show({severity: 'success', summary: 'Sampling on particular range',detail: 'Sampling End '}); 

            }).catch((err)=>{
                SetSampleLoader(false); 
                console.log(err)
                toast.current.show({severity: 'error', summary: 'error while fetching Sampling data on particular range', detail: 'Data Not Found'});
                msgs1.current.show({severity: 'error', summary: 'error while fetching Sampling data on particular range',detail: 'Sampling Error End '}); 

            })
              
            
      
        }
     }

    function MovingAverage(){

        if(MAStartDate === "" || MAEndDate === "" || MAColDrop==="" || MovAggDrop===""){
            toast.current.show({severity: 'error', summary: 'Error while Moving Average', detail: 'please select a values'});
            msgs1.current.show({severity: 'error', summary: 'Empty Value found',detail: 'Please select date and columns'});  
          
            return ; 

        } 
        else{
            toast.current.show({severity: 'info', summary: 'Loading ...', detail: 'please wait'});
            msgs1.current.show({severity: 'success', summary: 'Moving Average Starting',detail: 'Moving Average process starting'}); 
            
            let sd = ""
            let ed = "" 

            if(MAStartDate.getFullYear()>MAEndDate.getFullYear()){
                toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                return ;
            }
             
            else if(MAStartDate.getFullYear() === MAEndDate.getFullYear()){

                if(MAStartDate.getMonth()+1 > MAEndDate.getMonth()+1){
                    toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                    msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                    return ;
                }
                else if(MAStartDate.getMonth()+1 === MAEndDate.getMonth()+1){
                    if(MAStartDate.getDate()>MAEndDate.getDate()){
                        toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                        msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                        return ;
                    }
                }


            }


            let sdy = MAStartDate.getFullYear().toString()
            let sdm = (MAStartDate.getMonth()+1).toString()
            let sdd = MAStartDate.getDate().toString()   

            let edy = MAEndDate.getFullYear().toString()
            let edm = (MAEndDate.getMonth()+1).toString()
            let edd = MAEndDate.getDate().toString() 


            sdm = sdm.padStart(2,'0')
            sdd = sdd.padStart(2,'0')

            edm = edm.padStart(2,'0')
            edd = edd.padStart(2,'0')

            sd+=sdy+"-"+sdm+"-"+sdd 
            ed+=edy+"-"+edm+"-"+edd  

            
            console.log(sd)
            console.log(ed)

            let MAFormData = new FormData()
            MAFormData.append("target",MAColDrop)
           
            MAFormData.append("agg",MovAggDrop)
            MAFormData.append("sd",sd)
            MAFormData.append("ed",ed) 
            SetMALoader(true)
            
            axios.post("http://localhost:5000/movingagg",MAFormData,config).then((resp)=>{
                SetMALoader(false)
                SetMAImg(resp.data["movingagg"])
                SetMAImgVisible(true)
                toast.current.show({severity: 'info', summary: 'Moving Average on particular range', detail: 'Data Found'});
                msgs1.current.show({severity: 'success', summary: 'Moving Average on particular range',detail: 'Moving Average End '}); 

            }).catch((err)=>{
                SetMALoader(false); 
                console.log(err)
                toast.current.show({severity: 'error', summary: 'error while fetching Moving Average data on particular range', detail: 'Data Not Found'});
                msgs1.current.show({severity: 'error', summary: 'error while fetching Moving Average data on particular range',detail: 'Moving Average Error End '}); 

            })
              
            
      
        }
    }

    function CMA(){
       
        if(CMAStartDate === "" || CMAEndDate === "" || CMAColDrop==="" || CMAAggDrop===""){
            toast.current.show({severity: 'error', summary: 'Error while cummulative Moving Average', detail: 'please select a values'});
            msgs1.current.show({severity: 'error', summary: 'Empty Value found',detail: 'Please select date and columns'});  
          
            return ; 

        } 
        else{
            toast.current.show({severity: 'info', summary: 'Loading ...', detail: 'please wait'});
            msgs1.current.show({severity: 'success', summary: 'Cummulative Moving Average Starting',detail: 'Cummulative Moving Average process starting'}); 
            
            let sd = ""
            let ed = "" 

            if(CMAStartDate.getFullYear()>CMAEndDate.getFullYear()){
                toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                return ;
            }
             
            else if(CMAStartDate.getFullYear() === CMAEndDate.getFullYear()){

                if(CMAStartDate.getMonth()+1 > CMAEndDate.getMonth()+1){
                    toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                    msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                    return ;
                }
                else if(CMAStartDate.getMonth()+1 === CMAEndDate.getMonth()+1){
                    if(CMAStartDate.getDate()>CMAEndDate.getDate()){
                        toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                        msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                        return ;
                    }
                }


            }


            let sdy = CMAStartDate.getFullYear().toString()
            let sdm = (CMAStartDate.getMonth()+1).toString()
            let sdd = CMAStartDate.getDate().toString()   

            let edy = CMAEndDate.getFullYear().toString()
            let edm = (CMAEndDate.getMonth()+1).toString()
            let edd = CMAEndDate.getDate().toString() 


            sdm = sdm.padStart(2,'0')
            sdd = sdd.padStart(2,'0')

            edm = edm.padStart(2,'0')
            edd = edd.padStart(2,'0')

            sd+=sdy+"-"+sdm+"-"+sdd 
            ed+=edy+"-"+edm+"-"+edd  

            
            console.log(sd)
            console.log(ed)

            let CMAFormData = new FormData()
            CMAFormData.append("target",CMAColDrop)
           
            CMAFormData.append("agg",CMAAggDrop)
            CMAFormData.append("sd",sd)
            CMAFormData.append("ed",ed) 
            SetCMALoader(true)
            
            axios.post("http://localhost:5000/cma",CMAFormData,config).then((resp)=>{
                SetCMALoader(false)
                SetCMAImg(resp.data["cma"])
                SetCMAImgVisible(true)
                toast.current.show({severity: 'info', summary: 'Cumulative Moving Average on particular range', detail: 'Data Found'});
                msgs1.current.show({severity: 'success', summary: 'Cumulative Moving Average on particular range',detail: 'Cumulative Moving Average End '}); 

            }).catch((err)=>{
                SetCMALoader(false); 
                console.log(err)
                toast.current.show({severity: 'error', summary: 'error while fetching Moving Average data on particular range', detail: 'Data Not Found'});
                msgs1.current.show({severity: 'error', summary: 'error while fetching Moving Average data on particular range',detail: 'Moving Average Error End '}); 

            })
              
            
      
        }

    } 


    function EWMA(){
        if(EWMAStartDate === "" || EWMAEndDate === "" || EWMAColDrop==="" || EWMAAggDrop===""){
            toast.current.show({severity: 'error', summary: 'Error while Exponential Weighted Moving Average', detail: 'please select a values'});
            msgs1.current.show({severity: 'error', summary: 'Empty Value found',detail: 'Please select date and columns'});  
          
            return ; 

        } 
        else{
            toast.current.show({severity: 'info', summary: 'Loading ...', detail: 'please wait'});
            msgs1.current.show({severity: 'success', summary: 'Exponential Weighted Moving Average Starting',detail: 'Exponential Weighted Moving Average process starting'}); 
            
            let sd = ""
            let ed = "" 

            if(EWMAStartDate.getFullYear()>EWMAEndDate.getFullYear()){
                toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                return ;
            }
             
            else if(EWMAStartDate.getFullYear() === EWMAEndDate.getFullYear()){

                if(EWMAStartDate.getMonth()+1 > EWMAEndDate.getMonth()+1){
                    toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                    msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                    return ;
                }
                else if(EWMAStartDate.getMonth()+1 === EWMAEndDate.getMonth()+1){
                    if(EWMAStartDate.getDate()>EWMAEndDate.getDate()){
                        toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                        msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                        return ;
                    }
                }


            }


            let sdy = EWMAStartDate.getFullYear().toString()
            let sdm = (EWMAStartDate.getMonth()+1).toString()
            let sdd = EWMAStartDate.getDate().toString()   

            let edy = EWMAEndDate.getFullYear().toString()
            let edm = (EWMAEndDate.getMonth()+1).toString()
            let edd = EWMAEndDate.getDate().toString() 


            sdm = sdm.padStart(2,'0')
            sdd = sdd.padStart(2,'0')

            edm = edm.padStart(2,'0')
            edd = edd.padStart(2,'0')

            sd+=sdy+"-"+sdm+"-"+sdd 
            ed+=edy+"-"+edm+"-"+edd  

            
            console.log(sd)
            console.log(ed)

            let EWMAFormData = new FormData()
            EWMAFormData.append("target",EWMAColDrop)
           
            EWMAFormData.append("agg",EWMAAggDrop)
            EWMAFormData.append("sd",sd)
            EWMAFormData.append("ed",ed) 
            SetEWMALoader(true)
            
            axios.post("http://localhost:5000/ewma",EWMAFormData,config).then((resp)=>{
                SetEWMALoader(false)
                SetEWMAImg(resp.data["ewma"])
                SetEWMAImgVisible(true)
                toast.current.show({severity: 'info', summary: 'Exponential Weighted Moving Average on particular range', detail: 'Data Found'});
                msgs1.current.show({severity: 'success', summary: 'Exponential Moving Average on particular range',detail: 'Exponential Weighted Moving Average End '}); 

            }).catch((err)=>{
                SetEWMALoader(false); 
                console.log(err)
                toast.current.show({severity: 'error', summary: 'error while fetching Exponential Weighted Moving Average data on particular range', detail: 'Data Not Found'});
                msgs1.current.show({severity: 'error', summary: 'error while fetching Exponential Weighted Moving Average data on particular range',detail: 'Moving Average Error End '}); 

            })
              
            
      
        }
    }
    

    function TSA(){

        if(TSAStartDate === "" || TSAEndDate === "" || TSAColDrop==="" || TSAAggDrop===""){
            toast.current.show({severity: 'error', summary: 'Error while Time Series Comparator', detail: 'please select a values'});
            msgs1.current.show({severity: 'error', summary: 'Empty Value found',detail: 'Please select date and columns'});  
          
            return ; 

        } 
        else{
            toast.current.show({severity: 'info', summary: 'Loading ...', detail: 'please wait'});
            msgs1.current.show({severity: 'success', summary: 'Time Series Algorithm Comparator Starting',detail: 'Time Series Algorithm Analyser process starting'}); 
            
            let sd = ""
            let ed = "" 

            if(TSAStartDate.getFullYear()>TSAEndDate.getFullYear()){
                toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                return ;
            }
             
            else if(TSAStartDate.getFullYear() === TSAEndDate.getFullYear()){

                if(TSAStartDate.getMonth()+1 > TSAEndDate.getMonth()+1){
                    toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                    msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                    return ;
                }
                else if(TSAStartDate.getMonth()+1 === TSAEndDate.getMonth()+1){
                    if(TSAStartDate.getDate()>TSAEndDate.getDate()){
                        toast.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                        msgs1.current.show({severity: 'error', summary: 'Invalid Dates', detail: 'Start Date should be less than end Date'})
                        return ;
                    }
                }


            }


            let sdy = TSAStartDate.getFullYear().toString()
            let sdm = (TSAStartDate.getMonth()+1).toString()
            let sdd = TSAStartDate.getDate().toString()   

            let edy = TSAEndDate.getFullYear().toString()
            let edm = (TSAEndDate.getMonth()+1).toString()
            let edd = TSAEndDate.getDate().toString() 


            sdm = sdm.padStart(2,'0')
            sdd = sdd.padStart(2,'0')

            edm = edm.padStart(2,'0')
            edd = edd.padStart(2,'0')

            sd+=sdy+"-"+sdm+"-"+sdd 
            ed+=edy+"-"+edm+"-"+edd  

            
            console.log(sd)
            console.log(ed)

            let TSAFormData = new FormData()
            TSAFormData.append("target",TSAColDrop)
           
            TSAFormData.append("agg",TSAAggDrop)
            TSAFormData.append("sd",sd)
            TSAFormData.append("ed",ed) 
            SetTSALoader(true)
            
            axios.post("http://localhost:5000/tsa",TSAFormData,config).then((resp)=>{
                SetTSALoader(false)
                SetTSAImg(resp.data["ewma"])
                SetTSAImgVisible(true)
                toast.current.show({severity: 'info', summary: 'Time series analyser found on particular range', detail: 'Data Found'});
                msgs1.current.show({severity: 'success', summary: 'Time Series analyser found on particular range',detail: 'Time Series Analyser End '}); 

            }).catch((err)=>{
                SetTSALoader(false); 
                console.log(err)
                toast.current.show({severity: 'error', summary: 'error while fetching Time Series analyser data on particular range', detail: 'Data Not Found'});
                msgs1.current.show({severity: 'error', summary: 'error while fetching Time Series analyser data on particular range',detail: 'Time Series analyser End '}); 

            })
              
            
      
        }
    }

    // Home Navigator 

    function HomeNavigator(){
        navigate("/dashboard")
    }

  return (
    <div className={`${styles.sales}`} id="print"> 
        <div className={`${styles.saleshead}`}>
          <h3 className={`${styles.salesheader} card-header text-center`}>Digiverz Sales Forecast Time Series Analysis</h3>
          <button className='btn btn-dark' onClick={ExportPDF}>Download</button>  
          <button className='btn btn-dark' onClick={HomeNavigator}>Back to Home</button>
        </div>
        <Toast ref={toast}></Toast>
        <Messages ref={msgs1} /> 
        
        <div className={`${styles.saleimggrid}`}>
          <img src={`data:image/png;base64,${SalesPlot}`}alt='salesgraph' className={``}></img> 
          <img src={`data:image/png;base64,${DollPlot}`}alt='dollgraph' className={``}></img> 
          <img src={`data:image/png;base64,${QuantPlot}`}alt='quantgraph' className={``}></img>
        </div> 

        <h3 className={`${styles.saleszoomhead} card-head text-center`}>Sales Forecasting Zoomer</h3>
        <h5 className={`${styles.saleszoomdesc} text-center card-header bg-light`}>choose the Features variable and visualize the graph portion part by part</h5>
        <div className={`${styles.saleszoomdiv}`}> 

           <div>
              <Toast ref={toast}></Toast>
              <Messages ref={msgs1} /> 
              <Dropdown value={ZoomColDrop} options={TargetColumns} onChange={(e) => SetZoomColDrop(e.value)} className={`${styles.saleszoomdrop} bg-light text-black`} placeholder="Select a Column"/> 
              <Calendar dateFormat="dd/mm/yy" minDate={MinDate} maxDate={MaxDate} placeholder="Start Date"value={ZoomStartDate} onChange={(e) => SetZoomStartDate(e.value)} className={`${styles.saleszoomcal}`} showIcon></Calendar> 
              <Calendar dateFormat="dd/mm/yy" minDate={MinDate} maxDate={MaxDate} placeholder="End Date" value={ZoomEndDate} onChange={(e) => SetZoomEndDate(e.value)}  className={`${styles.saleszoomcal}`} showIcon></Calendar>  
              <Button label="Submit" icon="pi pi-check" iconPos="right"  onClick={SalesZoomer} className={`${styles.saleszoomcal}`} />
              
           </div> 

           <div>
              <CirclesWithBar height="100" width="100" color="cyan" wrapperStyle={{}} wrapperClass="" visible={ZoomLoader} outerCircleColor=""/>
              {
                ZoomImgVisible === true ?  <img src={`data:image/png;base64,${ZoomImg}`}alt='zoomgraph' className={``}></img> : null  
              }
           </div>

           
        </div>

        <div className={`${styles.resamplingdiv}`}>

          <h3 className={`card-header text-center ${styles.resamplinghead}`}>Resampling the Sales Features with Aggregation.</h3>
          <h5 className='text-center card-header bg-light'>Aggregating the curve for better visualization with Aggregations and Rules factors.</h5> 

          <div>
             <Toast ref={toast}></Toast>
             <Messages ref={msgs1} /> 
             <Dropdown value={RulesDrop} options={rulesKey} onChange={(e) => SetRulesDrop(e.value)} className={`${styles.saleszoomdrop} bg-light text-black`} placeholder="select a Sampling Rules"/> 
             <Dropdown value={AggDrop} options={aggrKey} onChange={(e) => SetAggDrop(e.value)} className={`${styles.saleszoomdrop} bg-light text-black`} placeholder="Select a Aggregation"/> 
             <Dropdown value={SampleColDrop} options={TargetColumns} onChange={(e) => SetSampleColDrop(e.value)} className={`${styles.saleszoomdrop} bg-light text-black`} placeholder="Select a Column"/> 
             <Calendar dateFormat="dd/mm/yy" minDate={MinDate} maxDate={MaxDate} placeholder="Start Date"value={SampleStartDate} onChange={(e) => SetSampleStartDate(e.value)} className={`${styles.saleszoomcal}`} showIcon></Calendar> 
             <Calendar dateFormat="dd/mm/yy" minDate={MinDate} maxDate={MaxDate} placeholder="End Date" value={SampleEndDate} onChange={(e) => SetSampleEndDate(e.value)}  className={`${styles.saleszoomcal}`} showIcon></Calendar>  
             <Button label="Submit" icon="pi pi-check" iconPos="right"  onClick={Resampling} className={`${styles.saleszoomcal}`} />
          
          </div>
         
          <div> 
            { RulesDrop !== "" && AggDrop!== "" ? <div>
                <h3 className={`card-header text-center ${styles.samplingdropdesc}`}>Sampling Rule is {RulesDrop+" : "+rules[RulesDrop]}</h3>
                <h3 className={`card-header text-center ${styles.samplingdropdesc}`}>Aggregation Mode is {AggDrop+" : "+aggregations[AggDrop]}</h3> 
              </div> : null 
            }
            <CirclesWithBar height="100" width="100" color="cyan" wrapperStyle={{}} wrapperClass="" visible={SampleLoader} outerCircleColor=""/> 
            {
                
                SamplingImgVisible === true ? <img src={`data:image/png;base64,${SamplingImg}`}alt='zoomgraph' className={``}></img> : null 
            }
          </div>

        </div>

        

        <div className={`${styles.movingavg}`}>
           <h3 className={`card-header text-center ${styles.mavgdesc}`}>Simple Moving Average </h3>  

           <div className=''>
             <Toast ref={toast}></Toast>
             <Messages ref={msgs1} /> 
            
             <Dropdown value={MovAggDrop} options={aggrKey} onChange={(e) => SetMovAggDrop(e.value)} className={`${styles.saleszoomdrop} bg-light text-black`} placeholder="Select a Aggregation"/> 
             <Dropdown value={MAColDrop} options={TargetColumns} onChange={(e) => SetMAColDrop(e.value)} className={`${styles.saleszoomdrop} bg-light text-black`} placeholder="Select a Column"/> 
             <Calendar dateFormat="dd/mm/yy" minDate={MinDate} maxDate={MaxDate} placeholder="Start Date"value={MAStartDate} onChange={(e) => SetMAStartDate(e.value)} className={`${styles.saleszoomcal}`} showIcon></Calendar> 
             <Calendar dateFormat="dd/mm/yy" minDate={MinDate} maxDate={MaxDate} placeholder="End Date" value={MAEndDate} onChange={(e) => SetMAEndDate(e.value)}  className={`${styles.saleszoomcal}`} showIcon></Calendar>  
             <Button label="Submit" icon="pi pi-check" iconPos="right"  onClick={MovingAverage} className={`${styles.saleszoomcal}`} />
        
           </div> 

           <div> 
            <CirclesWithBar height="100" width="100" color="cyan" wrapperStyle={{}} wrapperClass="" visible={MALoader} outerCircleColor=""/> 
            {
                MAImgVisible === true ? <img src={`data:image/png;base64,${MAImg}`}alt='MAgraph' className={``}></img> : null 
            }

           </div>

        </div>  

        <div className={`${styles.CMA}`}>
            <h3 className={`card-header text-center ${styles.mavgdesc}`}>Cummulative Moving Average.</h3>  
            <div className=''>
              <Toast ref={toast}></Toast>
              <Messages ref={msgs1} /> 
           
              <Dropdown value={CMAAggDrop} options={aggrKey} onChange={(e) => SetCMAAggDrop(e.value)} className={`${styles.saleszoomdrop} bg-light text-black`} placeholder="Select a Aggregation"/> 
              <Dropdown value={CMAColDrop} options={TargetColumns} onChange={(e) => SetCMAColDrop(e.value)} className={`${styles.saleszoomdrop} bg-light text-black`} placeholder="Select a Column"/> 
              <Calendar dateFormat="dd/mm/yy" minDate={MinDate} maxDate={MaxDate} placeholder="Start Date"value={CMAStartDate} onChange={(e) => SetCMAStartDate(e.value)} className={`${styles.saleszoomcal}`} showIcon></Calendar> 
              <Calendar dateFormat="dd/mm/yy" minDate={MinDate} maxDate={MaxDate} placeholder="End Date" value={CMAEndDate} onChange={(e) => SetCMAEndDate(e.value)}  className={`${styles.saleszoomcal}`} showIcon></Calendar>  
              <Button label="Submit" icon="pi pi-check" iconPos="right"  onClick={CMA} className={`${styles.saleszoomcal}`} />
       
            </div> 

            <div> 
              <CirclesWithBar height="100" width="100" color="cyan" wrapperStyle={{}} wrapperClass="" visible={CMALoader} outerCircleColor=""/> 
               {
                 CMAImgVisible === true ? <img src={`data:image/png;base64,${CMAImg}`}alt='CMAgraph' className={``}></img> : null 
               }

            </div>
        </div>


        <div className={`${styles.ewma}`}>
             <h3 className={`card-header text-center ${styles.mavgdesc}`}>Exponential weighted Moving Average.</h3>  
             <div className=''>
                <Toast ref={toast}></Toast>
                <Messages ref={msgs1} /> 
       
                <Dropdown value={EWMAAggDrop} options={aggrKey} onChange={(e) => SetEWMAAggDrop(e.value)} className={`${styles.saleszoomdrop} bg-light text-black`} placeholder="Select a Aggregation"/> 
                <Dropdown value={EWMAColDrop} options={TargetColumns} onChange={(e) => SetEWMAColDrop(e.value)} className={`${styles.saleszoomdrop} bg-light text-black`} placeholder="Select a Column"/> 
                <Calendar dateFormat="dd/mm/yy" minDate={MinDate} maxDate={MaxDate} placeholder="Start Date"value={EWMAStartDate} onChange={(e) => SetEWMAStartDate(e.value)} className={`${styles.saleszoomcal}`} showIcon></Calendar> 
                <Calendar dateFormat="dd/mm/yy" minDate={MinDate} maxDate={MaxDate} placeholder="End Date" value={EWMAEndDate} onChange={(e) => SetEWMAEndDate(e.value)}  className={`${styles.saleszoomcal}`} showIcon></Calendar>  
                <Button label="Submit" icon="pi pi-check" iconPos="right"  onClick={EWMA} className={`${styles.saleszoomcal}`} />
   
            </div> 

            <div> 
                <CirclesWithBar height="100" width="100" color="cyan" wrapperStyle={{}} wrapperClass="" visible={EWMALoader} outerCircleColor=""/> 
               {
                 EWMAImgVisible === true ? <img src={`data:image/png;base64,${EWMAImg}`}alt='CMAgraph' className={``}></img> : null 
               }

            </div>
        </div> 


        <div className={`${styles.tsa}`}>
            <h3 className={`card-header text-center ${styles.mavgdesc}`}>Time Series Analysis Comparator.</h3>  
            <div className=''>
                <Toast ref={toast}></Toast>
                <Messages ref={msgs1} /> 
  
                <Dropdown value={TSAAggDrop} options={aggrKey} onChange={(e) => SetTSAAggDrop(e.value)} className={`${styles.saleszoomdrop} bg-light text-black`} placeholder="Select a Aggregation"/> 
                <Dropdown value={TSAColDrop} options={TargetColumns} onChange={(e) => SetTSAColDrop(e.value)} className={`${styles.saleszoomdrop} bg-light text-black`} placeholder="Select a Column"/> 
                <Calendar dateFormat="dd/mm/yy" minDate={MinDate} maxDate={MaxDate} placeholder="Start Date"value={TSAStartDate} onChange={(e) => SetTSAStartDate(e.value)} className={`${styles.saleszoomcal}`} showIcon></Calendar> 
                <Calendar dateFormat="dd/mm/yy" minDate={MinDate} maxDate={MaxDate} placeholder="End Date" value={TSAEndDate} onChange={(e) => SetTSAEndDate(e.value)}  className={`${styles.saleszoomcal}`} showIcon></Calendar>  
                <Button label="Submit" icon="pi pi-check" iconPos="right"  onClick={TSA} className={`${styles.saleszoomcal}`} />

            </div> 

            <div> 
               <CirclesWithBar height="100" width="100" color="cyan" wrapperStyle={{}} wrapperClass="" visible={TSALoader} outerCircleColor=""/> 
              {
                 TSAImgVisible === true ? <img src={`data:image/png;base64,${TSAImg}`}alt='CMAgraph' className={``}></img> : null 
              }

            </div>

        </div>
    
        <div>
          <h3 className={`${styles.copyright} text-center card-footer`}>Digiverz KAAR Techologies Pvt Limited CopyRight @ {" " +copyright}</h3>
        </div>

    </div>
  )
}

export default SalesForecast