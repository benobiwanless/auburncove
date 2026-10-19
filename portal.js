import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const supabase=createClient('https://okwtxwbbjuibqwaqxquo.supabase.co','sb_publishable_gog_vREIg5Q6AylPSRdBbA_dkscQXBO');
const $=id=>document.getElementById(id);const show=(id,on)=>$(id).classList.toggle('hidden',!on);const msg=(id,t)=>$(id).textContent=t;
let currentUser=null;let admin=false;
async function refresh(){const {data:{user},error}=await supabase.auth.getUser();currentUser=error?null:user;show('auth',!currentUser);show('pending',false);show('library',false);if(!currentUser)return;const {data:profile,error:pe}=await supabase.from('profiles').select('approved,is_admin').eq('id',currentUser.id).single();if(pe||!profile?.approved){show('pending',true);return;}admin=!!profile.is_admin;show('library',true);show('admin',admin);await loadDocs();if(admin)await loadHomeowners();}
$('loginForm').addEventListener('submit',async e=>{e.preventDefault();msg('authMessage','Signing in…');const {error}=await supabase.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});msg('authMessage',error?error.message:'');if(!error)await refresh();});
$('register').onclick=async()=>{const email=$('email').value.trim(),password=$('password').value;if(!email||password.length<8){msg('authMessage','Enter your email and a password of at least 8 characters, then select Request Access.');return;}const {error}=await supabase.auth.signUp({email,password,emailRedirectTo:new URL('portal.html',location.href).href});msg('authMessage',error?error.message:'Registration requested. Check your email to confirm your address, then wait for administrator approval.');};
$('reset').onclick=async()=>{const email=$('email').value.trim();if(!email){msg('authMessage','Enter your email address first.');return;}const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:new URL('portal.html',location.href).href});msg('authMessage',error?error.message:'If the account exists, a password-reset email will arrive shortly.');};
supabase.auth.onAuthStateChange(async(event)=>{if(event==='PASSWORD_RECOVERY'){const password=prompt('Enter a new password (at least 8 characters):');if(password&&password.length>=8){const {error}=await supabase.auth.updateUser({password});alert(error?error.message:'Password updated.');}}});
async function logout(){await supabase.auth.signOut();await refresh();}$('logout').onclick=logout;$('pendingLogout').onclick=logout;
async function loadDocs(){msg('libraryMessage','Loading documents…');const {data,error}=await supabase.from('documents').select('id,title,category,storage_path,created_at').order('created_at',{ascending:false});if(error){msg('libraryMessage',error.message);return;}msg('libraryMessage',data.length?'':'No documents uploaded yet.');$('docs').replaceChildren();for(const doc of data){const li=document.createElement('li'),title=document.createElement('div'),name=document.createElement('strong'),meta=document.createElement('span'),btn=document.createElement('button');name.textContent=doc.title;meta.textContent=' · '+doc.category;title.append(name,meta);btn.textContent='Open PDF';btn.onclick=async()=>{btn.disabled=true;const {data:link,error}=await supabase.storage.from('hoa-documents').createSignedUrl(doc.storage_path,60);btn.disabled=false;if(error){msg('libraryMessage',error.message);return;}window.open(link.signedUrl,'_blank','noopener,noreferrer');};const actions=document.createElement('div');actions.className='item-actions';actions.append(btn);if(admin){const del=document.createElement('button');del.type='button';del.className='danger';del.textContent='Delete';del.onclick=async()=>{if(!confirm('Permanently delete the PDF “'+doc.title+'”? This cannot be undone.'))return;del.disabled=true;msg('libraryMessage','Deleting document…');const {error:storageError}=await supabase.storage.from('hoa-documents').remove([doc.storage_path]);if(storageError){msg('libraryMessage','Could not delete PDF: '+storageError.message);del.disabled=false;return;}const {error:dbError}=await supabase.from('documents').delete().eq('id',doc.id);if(dbError){msg('libraryMessage','PDF removed, but its listing could not be deleted: '+dbError.message);del.disabled=false;return;}await loadDocs();};actions.append(del);}li.append(title,actions);$('docs').append(li);}}
async function loadHomeowners(){
  const {data,error}=await supabase.from('profiles').select('id,email,approved,is_admin').order('email',{ascending:true});
  $('pendingUsers').replaceChildren();$('approvedUsers').replaceChildren();
  if(error){msg('homeownerMessage',error.message);return;}
  msg('homeownerMessage','');
  const pending=data.filter(p=>!p.approved),approved=data.filter(p=>p.approved);
  for(const [users,listId,emptyText] of [[pending,'pendingUsers','No pending requests.'],[approved,'approvedUsers','No approved homeowners.']]){
    if(!users.length){const li=document.createElement('li');li.textContent=emptyText;$(listId).append(li);continue;}
    for(const profile of users){
      const li=document.createElement('li'),label=document.createElement('span'),actions=document.createElement('div');
      actions.className='item-actions';label.textContent=profile.email+(profile.is_admin?' · Administrator':'');
      if(!profile.is_admin){
        const btn=document.createElement('button');btn.type='button';btn.textContent=profile.approved?'Revoke Access':'Approve';
        if(profile.approved)btn.className='danger';
        btn.onclick=async()=>{
          const question=profile.approved?'Revoke access for '+profile.email+'?':'Have you verified '+profile.email+' is an Auburn Cove homeowner?';
          if(!confirm(question))return;
          btn.disabled=true;
          const {data:changed,error:updateError}=await supabase.from('profiles').update({approved:!profile.approved}).eq('id',profile.id).eq('is_admin',false).select('id');
          if(updateError||!changed?.length){msg('homeownerMessage',updateError?.message||'No account was changed.');btn.disabled=false;return;}
          msg('homeownerMessage',profile.approved?'Homeowner access revoked.':'Homeowner approved.');await loadHomeowners();
        };actions.append(btn);
      }
      li.append(label,actions);$(listId).append(li);
    }
  }
}
$('uploadForm').addEventListener('submit',async e=>{e.preventDefault();const file=$('docFile').files[0];if(!file||file.type!=='application/pdf'||file.size>15*1024*1024){msg('adminMessage','Please select a PDF no larger than 15 MB.');return;}const path=crypto.randomUUID()+'.pdf';msg('adminMessage','Uploading…');const {error:upError}=await supabase.storage.from('hoa-documents').upload(path,file,{contentType:'application/pdf',upsert:false});if(upError){msg('adminMessage',upError.message);return;}const {error}=await supabase.from('documents').insert({title:$('docTitle').value.trim(),category:$('category').value,storage_path:path});msg('adminMessage',error?'File uploaded but document listing failed: '+error.message:'Document uploaded.');if(!error){$('uploadForm').reset();await loadDocs();}});
refresh().catch(e=>msg('authMessage',e.message));
