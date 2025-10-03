using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PharmaGo.Domain.Entities;
using PharmaGo.Domain.SearchCriterias;

namespace PharmaGo.IBusinessLogic
{
    public interface IPharmacyManager
    {
        IEnumerable<Pharmacy> GetAll(PharmacySearchCriteria pharmacySearchCriteria);
        Pharmacy GetById(int id);
        Pharmacy Create(Pharmacy pharmacy);
        Pharmacy Update(int id, Pharmacy pharmacy);
        void Delete(int id);
    }
}
