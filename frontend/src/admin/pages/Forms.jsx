import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { FormAPI } from '../../lib/api';

const KEYS = ['contact','services'];

function defaultTemplate(key){
  if(key === 'contact'){
    return {
      key: 'contact', enabled: true,
      title: "Let's work together",
      subtitle: 'Ready to take your business to the next level? Reach out, and let s discuss how we can help.',
      buttonText: 'Submit', successMessage: 'Thanks! Your message has been sent.',
      fields: [
        { name:'name', label:'Name', type:'text', placeholder:'Your name', required:true, order:0 },
        { name:'email', label:'Email', type:'email', placeholder:'Email address', required:true, order:1 },
        { name:'company', label:'Company', type:'text', placeholder:'Company name', required:false, order:2 },
        { name:'phone', label:'Phone', type:'tel', placeholder:'Phone (optional)', required:false, order:3 },
        { name:'website', label:'Website (if any)', type:'text', placeholder:'https://', required:false, order:4 },
        { name:'budget', label:'Budget', type:'select', required:false, order:5,
          options:[{label:'< $1k',value:'<1k'},{label:'$1k–$5k',value:'1k-5k'},{label:'$5k–$10k',value:'5k-10k'},{label:'$10k+',value:'10k+'}] },
        { name:'message', label:'Tell us more about your project', type:'textarea', placeholder:'Share a bit about goals, timeline, and scope.', required:true, order:6 },
      ],
    };
  }
  return {
    key: 'services', enabled: true,
    title: 'Let s build something great',
    subtitle: 'Tell us briefly about your goals. We ll reply within 1 business day.',
    buttonText: 'Submit', successMessage: 'Thanks! We\'ll get back to you shortly.',
    fields: [
      { name:'name', label:'Name', type:'text', placeholder:'Your name', required:true, order:0 },
      { name:'email', label:'Email', type:'email', placeholder:'Email address', required:true, order:1 },
      { name:'phone', label:'Phone', type:'tel', placeholder:'Phone (optional)', required:false, order:2 },
      { name:'message', label:'Message', type:'textarea', placeholder:'What do you want to build?', required:true, order:3 },
    ],
  };
}

function TypeBadge({ type }){
  const colorMap = {
    text: 'bg-blue-500',
    email: 'bg-cyan-500',
    tel: 'bg-green-500',
    textarea: 'bg-purple-500',
    select: 'bg-amber-500'
  };
  const bgColor = colorMap[type] || 'bg-slate-500';
  
  return (
    <span className={`${bgColor} text-white text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded whitespace-nowrap`}>
      {type}
    </span>
  );
}

function Preview({ model }){
  const fields = (model?.fields||[]);
  
  const typeToInput = (f)=>{
    if(f.type==='textarea') return (
      <div className="form-field" key={f.name}>
        <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5">{f.label}</label>
        <textarea 
          placeholder={f.placeholder||''} 
          rows="4" 
          readOnly 
          className="w-full min-h-[80px] sm:min-h-[100px] px-2.5 sm:px-3 py-2 text-xs sm:text-sm border rounded-md resize-none"
        />
      </div>
    );
    
    if(f.type==='select') return (
      <div className="form-field" key={f.name}>
        <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5">{f.label}</label>
        <select disabled className="w-full min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-md">
          <option>{f.placeholder||'Select'}</option>
          {(f.options||[]).map(o=> <option key={o.value||o.label}>{o.label}</option>)}
        </select>
      </div>
    );
    
    const t = (f.type==='email'?'email': f.type==='tel'?'tel':'text');
    return (
      <div className="form-field" key={f.name}>
        <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5">{f.label}</label>
        <input 
          type={t} 
          placeholder={f.placeholder||''} 
          readOnly 
          className="w-full min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-md"
        />
      </div>
    );
  };
  
  return (
    <div className="card p-2.5 sm:p-3 md:p-4">
      <strong className="block mb-2 text-xs sm:text-sm md:text-base">Live preview</strong>
      {model?.title && (
        <h3 className="m-0 mb-1 text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
          {model.title}
        </h3>
      )}
      {model?.subtitle && (
        <p className="muted m-0 mb-2 sm:mb-3 text-xs sm:text-sm md:text-base">{model.subtitle}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
        {fields.slice(0,2).map(typeToInput)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
        {fields.slice(2,4).map(typeToInput)}
      </div>
      {fields.slice(4).map(typeToInput)}
      <div className="mt-2">
        <button className="btn cta-solid min-h-[40px] sm:min-h-[44px] px-4 sm:px-6 text-sm" disabled>
          {model?.buttonText||'Submit'}
        </button>
      </div>
    </div>
  );
}

export default function Forms(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const byKey = useMemo(()=> Object.fromEntries(items.map(i=>[i.key, i])), [items]);

  const [editingKey, setEditingKey] = useState('contact');
  const editing = byKey[editingKey] || defaultTemplate(editingKey);
  const [model, setModel] = useState(editing);

  useEffect(()=>{ setModel(editing); }, [editingKey, items]);

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const res = await FormAPI.list();
        setItems(res.items || []);
      }catch(e){ setError(e.message||'Failed to load form configs'); }
      finally{ setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[]);

  async function save(){
    try{
      const exists = byKey[model.key];
      const payload = { ...model, fields: (model.fields||[]).map((f,i)=>({ ...f, order: i })) };
      if(exists){
        const updated = await FormAPI.update(exists._id || exists.id, payload);
        setItems(prev=> prev.map(it=> (it.key===updated.key? updated : it)));
      }else{
        const created = await FormAPI.create(payload);
        setItems(prev=> [...prev, created]);
      }
      alert('Saved');
    }catch(e){ alert(e.message||'Save failed'); }
  }

  function addField(){
    setModel(m=> ({ ...m, fields:[...(m.fields||[]), { name:'field'+((m.fields?.length||0)+1), label:'Field', type:'text', placeholder:'', required:false }] }));
  }
  
  function removeField(idx){
    setModel(m=> ({ ...m, fields: (m.fields||[]).filter((_,i)=> i!==idx) }));
  }
  
  function moveField(idx, dir){
    setModel(m=>{
      const arr=[...(m.fields||[])];
      const j=idx+dir; if(j<0||j>=arr.length) return m;
      const t=arr[idx]; arr[idx]=arr[j]; arr[j]=t; return { ...m, fields: arr };
    });
  }

  return (
    <div className="admin-layout create-post">
      <AdminSidebar />
      <main className="admin-content forms-page">
        <AdminTopbar />
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-2.5 flex-wrap px-2 sm:px-3 lg:px-5 py-2 sm:py-3 md:py-4">
          <div className="flex-1 min-w-[180px]">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold m-0 mb-1 sm:mb-2">Forms</h1>
            <small className="muted block text-[10px] sm:text-xs md:text-sm break-words leading-tight">
              Editing: <strong>{editingKey}</strong> → {editingKey==='contact' ? 'Contact page' : 'Services page (bottom form)'}
            </small>
          </div>
          <div className="flex gap-1.5 flex-wrap w-full sm:w-auto">
            <button className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap flex-1 sm:flex-none" onClick={save}>
              Save
            </button>
          </div>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div className="card mt-3 sm:mt-4 mx-2 sm:mx-3 lg:mx-5 p-3 sm:p-4 lg:p-6 text-xs sm:text-sm">
            Loading…
          </div>
        )}
        
        {error && (
          <div className="card mt-3 sm:mt-4 mx-2 sm:mx-3 lg:mx-5 p-3 sm:p-4 lg:p-6 text-red-500 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[300px_1fr] gap-2.5 sm:gap-3 md:gap-4 mt-2.5 sm:mt-3 md:mt-4 px-2 sm:px-3 lg:px-5 pb-4 sm:pb-6">
            
            {/* Form Selector Sidebar */}
            <div className="card p-2 sm:p-2.5 md:p-3 lg:p-4">
              <div className="flex justify-between items-center mb-2">
                <strong className="text-xs sm:text-sm md:text-base">Select form</strong>
              </div>
              
              <div className="grid gap-1.5 sm:gap-2">
                {KEYS.map(k=> {
                  const st = byKey[k];
                  const isOn = !!st?.enabled;
                  return (
                    <button 
                      key={k} 
                      className={`btn selector-btn ${editingKey===k?'cta-solid':'secondary'} flex justify-between items-center w-full px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base rounded-md`}
                      onClick={()=>setEditingKey(k)}
                    >
                      <span className="lowercase">{k}</span>
                      <span 
                        className={`badge text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap ${
                          isOn 
                            ? 'bg-green-500/10 border-green-500/45 text-green-500' 
                            : 'bg-red-500/10 border-red-500/45 text-red-500'
                        }`}
                      >
                        {isOn? 'Published' : 'Disabled'}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              <div className="divider my-3 sm:my-4"></div>
            </div>

            {/* Settings Panel */}
            <div className="grid gap-2.5 sm:gap-3 md:gap-3.5 lg:sticky lg:top-[84px] lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto">
              
              {/* Settings Section */}
              <div className="card p-2 sm:p-2.5 md:p-3 lg:p-4">
                <strong className="block mb-2.5 sm:mb-3 md:mb-3.5 text-xs sm:text-sm md:text-base">Settings</strong>
                
                {/* Enable Toggle & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 md:gap-3 mb-2.5 sm:mb-3 md:mb-3.5">
                  <div className="form-field">
                    <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5">
                      Enabled 
                      <small className="muted ml-1 text-[10px] sm:text-xs">
                        {model.enabled? '(Published)' : '(Disabled)'}
                      </small>
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={!!model.enabled}
                      onClick={()=> setModel(m=> ({...m, enabled: !m.enabled}))}
                      className={`inline-flex items-center w-[50px] sm:w-[54px] h-[28px] sm:h-[30px] rounded-full relative p-0.5 transition-all duration-200 ${
                        model.enabled 
                          ? 'bg-gradient-to-b from-emerald-400 to-emerald-500 border border-emerald-500/55' 
                          : 'bg-slate-400/35 border border-slate-400/45'
                      }`}
                    >
                      <span 
                        className={`w-[24px] sm:w-[26px] h-[24px] sm:h-[26px] rounded-full bg-white shadow-md transition-transform duration-200 ${
                          model.enabled ? 'translate-x-[22px] sm:translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="form-field">
                    <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5">
                      Notify Email (optional)
                    </label>
                    <input 
                      value={model.notifyEmail||''} 
                      onChange={e=>setModel(m=>({...m, notifyEmail:e.target.value}))} 
                      placeholder="hello@devugo.tech"
                      className="w-full min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-md"
                    />
                  </div>
                </div>

                {/* Title & Button Text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 md:gap-3 mb-2.5 sm:mb-3 md:mb-3.5">
                  <div className="form-field">
                    <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5">Title</label>
                    <input 
                      value={model.title||''} 
                      onChange={e=>setModel(m=>({...m, title:e.target.value}))}
                      className="w-full min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-md"
                    />
                    <div className="hint text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                      Shown as the form heading on the page.
                    </div>
                  </div>
                  
                  <div className="form-field">
                    <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5">Button text</label>
                    <input 
                      value={model.buttonText||''} 
                      onChange={e=>setModel(m=>({...m, buttonText:e.target.value}))}
                      className="w-full min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-md"
                    />
                    <div className="hint text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                      Separate for Contact vs Services.
                    </div>
                  </div>
                </div>

                {/* Subtitle */}
                <div className="form-field mb-2.5 sm:mb-3 md:mb-3.5">
                  <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5">Subtitle</label>
                  <input 
                    value={model.subtitle||''} 
                    onChange={e=>setModel(m=>({...m, subtitle:e.target.value}))}
                    className="w-full min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-md"
                  />
                  <div className="hint text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                    A short helper sentence under the title.
                  </div>
                </div>

                {/* Success Message */}
                <div className="form-field">
                  <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-1.5">Success message</label>
                  <input 
                    value={model.successMessage||''} 
                    onChange={e=>setModel(m=>({...m, successMessage:e.target.value}))}
                    className="w-full min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-md"
                  />
                  <div className="hint text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                    Shown after successful submit.
                  </div>
                </div>

                <div className="divider my-2.5 sm:my-3 md:my-4"></div>

                {/* Fields Header */}
                <div className="flex justify-between items-center flex-wrap gap-1.5 sm:gap-2 mb-2">
                  <strong className="text-xs sm:text-sm md:text-base">Fields</strong>
                  <button 
                    className="btn-secondary px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md" 
                    onClick={addField}
                  >
                    Add field
                  </button>
                </div>

                {/* Fields List */}
                <div className="grid gap-2 sm:gap-2.5 lg:max-h-[50vh] lg:overflow-y-auto lg:pr-1 sm:lg:pr-2">
                  {(model.fields||[]).map((f,idx)=> (
                    <div key={idx} className="card p-2 sm:p-2.5 md:p-3 grid gap-1.5 sm:gap-2">
                      
                      {/* Field Header */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-2 flex-wrap">
                        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 min-w-0 flex-wrap flex-1">
                          <strong className="truncate text-xs sm:text-sm">
                            {f.name||'field'}
                          </strong>
                          <TypeBadge type={f.type||'text'} />
                          {f.required && (
                            <span className="badge bg-red-500 text-white text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded whitespace-nowrap">
                              required
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-1 sm:gap-1.5 flex-wrap w-full sm:w-auto justify-end">
                          <button 
                            className="btn-secondary px-1.5 sm:px-2 md:px-2.5 py-1 text-[10px] sm:text-xs min-h-[32px] sm:min-h-[36px] rounded" 
                            onClick={()=>moveField(idx,-1)} 
                            disabled={idx===0}
                          >
                            Up
                          </button>
                          <button 
                            className="btn-secondary px-1.5 sm:px-2 md:px-2.5 py-1 text-[10px] sm:text-xs min-h-[32px] sm:min-h-[36px] rounded" 
                            onClick={()=>moveField(idx,1)} 
                            disabled={idx===(model.fields?.length||0)-1}
                          >
                            Down
                          </button>
                          <button 
                            className="btn-secondary px-1.5 sm:px-2 md:px-2.5 py-1 text-[10px] sm:text-xs min-h-[32px] sm:min-h-[36px] rounded" 
                            onClick={()=>removeField(idx)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Name & Label */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 md:gap-3">
                        <div className="form-field">
                          <label className="block text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1">Name (key)</label>
                          <input 
                            value={f.name} 
                            onChange={e=>setModel(m=>{ 
                              const arr=[...m.fields]; 
                              arr[idx]={...arr[idx],name:e.target.value}; 
                              return {...m,fields:arr}; 
                            })}
                            className="w-full min-h-[36px] sm:min-h-[40px] md:min-h-[44px] px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs md:text-sm border rounded-md"
                          />
                        </div>
                        
                        <div className="form-field">
                          <label className="block text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1">Label</label>
                          <input 
                            value={f.label} 
                            onChange={e=>setModel(m=>{ 
                              const arr=[...m.fields]; 
                              arr[idx]={...arr[idx],label:e.target.value}; 
                              return {...m,fields:arr}; 
                            })}
                            className="w-full min-h-[36px] sm:min-h-[40px] md:min-h-[44px] px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs md:text-sm border rounded-md"
                          />
                        </div>
                      </div>

                      {/* Type & Placeholder */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 md:gap-3">
                        <div className="form-field">
                          <label className="block text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1">Type</label>
                          <select 
                            value={f.type} 
                            onChange={e=>setModel(m=>{ 
                              const arr=[...m.fields]; 
                              arr[idx]={...arr[idx],type:e.target.value}; 
                              return {...m,fields:arr}; 
                            })}
                            className="w-full min-h-[36px] sm:min-h-[40px] md:min-h-[44px] px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs md:text-sm border rounded-md bg-white text-slate-900"
                          >
                            <option value="text">Text</option>
                            <option value="email">Email</option>
                            <option value="tel">Phone</option>
                            <option value="textarea">Textarea</option>
                            <option value="select">Select</option>
                          </select>
                        </div>
                        
                        <div className="form-field">
                          <label className="block text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1">Placeholder</label>
                          <input 
                            value={f.placeholder||''} 
                            onChange={e=>setModel(m=>{ 
                              const arr=[...m.fields]; 
                              arr[idx]={...arr[idx],placeholder:e.target.value}; 
                              return {...m,fields:arr}; 
                            })}
                            className="w-full min-h-[36px] sm:min-h-[40px] md:min-h-[44px] px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs md:text-sm border rounded-md"
                          />
                        </div>
                      </div>

                      {/* Select Options */}
                      {f.type==='select' && (
                        <div className="form-field">
                          <label className="block text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1">
                            Options (label:value per line)
                          </label>
                          <textarea 
                            rows="3" 
                            value={(f.options||[]).map(o=>`${o.label}:${o.value}`).join('\n')} 
                            onChange={e=>{
                              const lines=e.target.value.split('\n').map(s=>s.trim()).filter(Boolean);
                              const opts=lines.map(l=>{ 
                                const [label,...rest]=l.split(':'); 
                                return { label, value: rest.join(':')||label } 
                              });
                              setModel(m=>{ 
                                const arr=[...m.fields]; 
                                arr[idx]={...arr[idx],options:opts}; 
                                return {...m,fields:arr}; 
                              });
                            }}
                            className="w-full min-h-[65px] sm:min-h-[75px] px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs md:text-sm border rounded-md resize-none"
                          />
                        </div>
                      )}

                      {/* Required Checkbox */}
                      <label className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={!!f.required} 
                          onChange={e=>setModel(m=>{ 
                            const arr=[...m.fields]; 
                            arr[idx]={...arr[idx],required:e.target.checked}; 
                            return {...m,fields:arr}; 
                          })}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                        /> 
                        Required
                      </label>
                    </div>
                  ))}
                </div>
              </div>

               {/* Live Preview */}
              <Preview model={model} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}