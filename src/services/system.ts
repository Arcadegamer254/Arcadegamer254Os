export const systemApi = {
  async getPersonalization() {
    const res = await fetch('/api/system/personalization');
    return res.json();
  },
  
  async updatePersonalization(updates: any) {
    const res = await fetch('/api/system/personalization', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },
  
  async launchApp(appId: string) {
    const res = await fetch('/api/system/apps/launch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId })
    });
    return res.json();
  },
  
  async getBattery() {
    const res = await fetch('/api/system/battery');
    return res.json();
  },
  
  async getWifi() {
    const res = await fetch('/api/system/wifi');
    return res.json();
  }
};
