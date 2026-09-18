export function ensureV2State(state){
  state.version=Math.max(Number(state.version||1),2);
  state.specialPrices ||= [];
  state.priceHistory ||= [];
  state.settings ||= {};
  state.settings.store ||= 'TB Bisma';
  state.settings.owner ||= 'BISMA PUTRA RASTIKA';
  state.settings.dana ||= '085198580017';
  state.settings.seabank ||= '901869157871';
  state.settings.qrisLabel ||= 'QRIS TB Bisma';
  return state;
}

export function installV2(ctx){
  const {views,actions,nav,getState,save,render,helpers}=ctx;
  const {money,date,esc,title,btn,table,modal,val,uid,now,log,activeProducts}=helpers;

  if(!nav.some(n=>n[0]==='pricing')) nav.splice(nav.length-1,0,['pricing','Harga Pelanggan']);
  if(!nav.some(n=>n[0]==='settings')) nav.push(['settings','Pengaturan']);

  const todayKey=()=>new Date().toDateString();
  const todayTx=()=>getState().transactions.filter(t=>new Date(t.date).toDateString()===todayKey());
  const todayExp=()=>getState().expenses.filter(e=>new Date(e.date).toDateString()===todayKey());
  const sum=(xs,fn)=>xs.reduce((a,x)=>a+Number(fn(x)||0),0);

  views.dashboard=()=>{
    const s=getState(), ps=activeProducts(), low=ps.filter(p=>Number(p.stock)<=Number(p.minStock||0));
    const tx=todayTx(), exp=todayExp();
    const omzet=sum(tx,t=>t.total), gross=sum(tx,t=>t.profit), expense=sum(exp,e=>e.amount);
    const debt=s.debts.reduce((a,d)=>a+Math.max(0,Number(d.total||0)-Number(d.paid||0)),0);
    const top=new Map();
    tx.forEach(t=>(t.items||[]).forEach(i=>top.set(i.id,{name:i.name,qty:(top.get(i.id)?.qty||0)+Number(i.qty||0)})));
    const topItems=[...top.values()].sort((a,b)=>b.qty-a.qty).slice(0,5);
    return title('Dashboard Hari Ini')+
      `<div class="grid">
        <div class="card stat">Omzet Hari Ini<b>${money(omzet)}</b></div>
        <div class="card stat">Laba Kotor<b>${money(gross)}</b></div>
        <div class="card stat">Pengeluaran<b>${money(expense)}</b></div>
        <div class="card stat">Laba Setelah Pengeluaran<b>${money(gross-expense)}</b></div>
        <div class="card stat">Transaksi<b>${tx.length}</b></div>
        <div class="card stat">Piutang Aktif<b>${money(debt)}</b></div>
        <div class="card stat">Total Barang<b>${ps.length}</b></div>
        <div class="card stat">Stok Menipis<b class="low">${low.length}</b></div>
      </div>
      <div class="toolbar">${btn('Transaksi Baru','goCash')}${btn('Tambah Barang','addProduct','')}${btn('Stok Masuk','addStock','')}${btn('Tambah Bon','addDebt','')}</div>
      <div class="grid">
        <div class="card"><h3>Barang Terlaris Hari Ini</h3>${topItems.map((x,i)=>`<p><b>#${i+1} ${esc(x.name)}</b> — ${x.qty} terjual</p>`).join('')||'<div class="empty">Belum ada transaksi hari ini</div>'}</div>
        <div class="card"><h3>Stok Hampir Habis</h3>${low.slice(0,10).map(p=>`<p><b>${esc(p.name)}</b> ${esc(p.variant||'')} — <span class="low">${p.stock} ${esc(p.unit||'')}</span></p>`).join('')||'<div class="empty">Semua stok aman</div>'}</div>
      </div>`;
  };

  views.pricing=()=>{
    const s=getState();
    const rows=s.specialPrices.map(r=>{
      const c=s.customers.find(x=>x.id===r.customerId), p=s.products.find(x=>x.id===r.productId);
      return `<tr><td>${esc(c?.name||'Pelanggan dihapus')}</td><td>${esc(p?.name||'Barang dihapus')} ${esc(p?.variant||'')}</td><td>${money(r.price)}</td><td>${btn('Hapus','removeSpecialPrice','danger',r.id)}</td></tr>`;
    }).join('');
    return title('Harga Khusus Pelanggan',btn('+ Tambah Harga Khusus','addSpecialPrice'))+
      '<div class="card"><p>Harga khusus dapat diterapkan ke keranjang kasir berdasarkan pelanggan yang dipilih.</p></div>'+
      table(['Pelanggan','Barang','Harga Khusus','Aksi'],rows);
  };

  views.settings=()=>{
    const s=getState(), st=s.settings;
    return title('Pengaturan Toko')+`<div class="card"><div class="formgrid">
      <label>Nama toko<input id="setStore" class="input" value="${esc(st.store||'')}"></label>
      <label>Nama pemilik<input id="setOwner" class="input" value="${esc(st.owner||'')}"></label>
      <label>DANA<input id="setDana" class="input" value="${esc(st.dana||'')}"></label>
      <label>SeaBank<input id="setSea" class="input" value="${esc(st.seabank||'')}"></label>
      <label class="full">Label QRIS<input id="setQris" class="input" value="${esc(st.qrisLabel||'')}"></label>
    </div><div class="toolbar">${btn('Simpan Pengaturan','saveSettings')}</div></div>`;
  };

  const oldReports=views.reports;
  views.reports=()=>{
    const s=getState(), base=oldReports();
    const sales=new Map();
    s.transactions.forEach(t=>(t.items||[]).forEach(i=>{
      const x=sales.get(i.id)||{name:i.name,qty:0,revenue:0,profit:0};
      x.qty+=Number(i.qty||0); x.revenue+=Number(i.qty||0)*Number(i.price||0); x.profit+=Number(i.qty||0)*(Number(i.price||0)-Number(i.cost||0)); sales.set(i.id,x);
    }));
    const rows=[...sales.values()].sort((a,b)=>b.qty-a.qty).slice(0,20).map(x=>`<tr><td>${esc(x.name)}</td><td>${x.qty}</td><td>${money(x.revenue)}</td><td>${money(x.profit)}</td></tr>`).join('');
    const hist=s.priceHistory.slice(0,15).map(h=>`<tr><td>${date(h.date)}</td><td>${esc(h.product)}</td><td>${money(h.oldPrice)} → ${money(h.newPrice)}</td><td>${money(h.oldCost)} → ${money(h.newCost)}</td></tr>`).join('');
    return base+`<div class="card" style="margin-top:14px"><h3>20 Barang Terlaris</h3>${table(['Barang','Qty Terjual','Omzet','Laba Kotor'],rows)}</div>
      <div class="card" style="margin-top:14px"><h3>Riwayat Perubahan Harga</h3>${table(['Tanggal','Barang','Harga Jual','Harga Modal'],hist)}</div>`;
  };

  const oldCashier=views.cashier;
  views.cashier=()=>{
    const html=oldCashier();
    const s=getState();
    const opts=s.customers.map(c=>`<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('');
    return html.replace('<label class="full">Nama pelanggan (opsional)<input id="buyer" class="input"></label>',
      `<label class="full">Nama pelanggan (opsional)<input id="buyer" class="input" list="customerList"><datalist id="customerList">${opts}</datalist></label>
       <div class="full"><button class="btn" data-act="applyCustomerPrices">Terapkan Harga Pelanggan</button></div>`);
  };

  actions.addSpecialPrice=()=>{
    const s=getState();
    if(!s.customers.length) return alert('Tambahkan pelanggan dulu.');
    const customers=s.customers.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
    const products=activeProducts().map(p=>`<option value="${p.id}">${esc(p.name)} ${esc(p.variant||'')} — ${money(p.price)}</option>`).join('');
    const m=modal(`<h3>Harga Khusus Pelanggan</h3><div class="formgrid"><label>Pelanggan<select id="customer" class="input">${customers}</select></label><label>Barang<select id="product" class="input">${products}</select></label><label>Harga khusus<input id="price" type="number" class="input"></label></div><div class="toolbar"><button class="btn primary" id="save">Simpan</button><button class="btn" id="close">Batal</button></div>`);
    m.querySelector('#close').onclick=()=>m.remove();
    m.querySelector('#save').onclick=async()=>{
      const customerId=val(m,'customer'), productId=val(m,'product'), price=Number(val(m,'price'));
      if(!price) return alert('Isi harga khusus.');
      const existing=s.specialPrices.find(x=>x.customerId===customerId&&x.productId===productId);
      if(existing) existing.price=price; else s.specialPrices.unshift({id:uid('sp'),customerId,productId,price,date:now()});
      log('Harga khusus pelanggan diperbarui'); await save('Harga khusus disimpan'); m.remove(); render();
    };
  };

  actions.removeSpecialPrice=async id=>{
    const s=getState(); s.specialPrices=s.specialPrices.filter(x=>x.id!==id); await save('Harga khusus dihapus'); render();
  };

  actions.applyCustomerPrices=async()=>{
    const s=getState(), name=(document.querySelector('#buyer')?.value||'').trim().toLowerCase();
    const customer=s.customers.find(c=>(c.name||'').trim().toLowerCase()===name);
    if(!customer) return alert('Pilih pelanggan yang sudah tersimpan.');
    let count=0;
    s.cart.forEach(i=>{ const rule=s.specialPrices.find(r=>r.customerId===customer.id&&r.productId===i.id); if(rule){i.price=Number(rule.price);count++;} });
    await save(count?count+' harga khusus diterapkan':'Tidak ada harga khusus untuk keranjang ini'); render();
  };

  actions.saveSettings=async()=>{
    const s=getState();
    s.settings.store=document.querySelector('#setStore')?.value||'TB Bisma';
    s.settings.owner=document.querySelector('#setOwner')?.value||'';
    s.settings.dana=document.querySelector('#setDana')?.value||'';
    s.settings.seabank=document.querySelector('#setSea')?.value||'';
    s.settings.qrisLabel=document.querySelector('#setQris')?.value||'';
    log('Pengaturan toko diperbarui'); await save('Pengaturan disimpan'); render();
  };
}
