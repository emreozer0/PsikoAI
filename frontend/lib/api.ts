const API_URL = "http://localhost:8000"

export async function getHastalar() {
  const token = localStorage.getItem('token')
  const res = await fetch(API_URL + "/hastalar", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  const data = await res.json()
  return data.map((h: any) => ({
    id: String(h.id),
    name: h.ad,
    diagnosis: h.tani,
    lastSession: "-",
    sessionCount: 0,
    initials: h.ad.split(" ").map((n: string) => n[0]).join("")
  }))
}

export async function hastaEkle(ad: string, tani: string) {
  const token = localStorage.getItem('token')
  const res = await fetch(API_URL + "/hastalar?ad=" + ad + "&tani=" + tani, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return res.json()
}

export async function hastaSil(id: string) {
  const token = localStorage.getItem('token')
  const res = await fetch(API_URL + "/hastalar/" + id, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return res.json()
}

export async function hastaGuncelle(id: string, ad: string, tani: string) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_URL}/hastalar/${id}?ad=${ad}&tani=${tani}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return res.json()
}

export async function transkribeEt(dosya: File) {
  const formData = new FormData()
  formData.append("dosya", dosya)
  const res = await fetch(API_URL + "/transkripsiyon/transkribe", {
    method: "POST",
    body: formData
  })
  return res.json()
}

export async function formulasyonOlustur(hasta_id: string, transkript: string, seans_no: number = 1) {
  const token = localStorage.getItem('token')
  const bugun = new Date().toISOString().split('T')[0]
  const res = await fetch(`${API_URL}/analiz/formulasyon`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      hasta_id: Number(hasta_id),
      transkript,
      seans_no,
      seans_tarihi: bugun
    })
  })
  return res.json()
}

export async function analizOnayla(analiz_id: number) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_URL}/analiz/${analiz_id}/onayla`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}

export async function analizReddet(analiz_id: number) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_URL}/analiz/${analiz_id}/reddet`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}

export async function hastaAnalizleri(hasta_id: string) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_URL}/analiz/hasta/${hasta_id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return res.json()
}