import { apiWithRefresh } from '../lib/apiInterceptor';

export const CompanyInfoAPI = {
  getPublic: async () => {
    try {
      console.log('📡 CompanyInfoAPI.getPublic called');
      const data = await apiWithRefresh('/api/company-info/public', { method: 'GET' });
      console.log('✅ CompanyInfoAPI.getPublic response:', data);
      return data;
    } catch (error) {
      console.error('❌ CompanyInfoAPI.getPublic error:', error);
      throw error;
    }
  },
  
  get: async () => {
    try {
      console.log('📡 CompanyInfoAPI.get called');
      const data = await apiWithRefresh('/api/company-info', { method: 'GET' });
      console.log('✅ CompanyInfoAPI.get response:', data);
      return data;
    } catch (error) {
      console.error('❌ CompanyInfoAPI.get error:', error);
      throw error;
    }
  },
  
  update: async (payload) => {
    try {
      console.log('📡 CompanyInfoAPI.update called with:', payload);
      const data = await apiWithRefresh('/api/company-info', { 
        method: 'PUT', 
        body: payload 
      });
      console.log('✅ CompanyInfoAPI.update response:', data);
      return data;
    } catch (error) {
      console.error('❌ CompanyInfoAPI.update error:', error);
      throw error;
    }
  },
};  