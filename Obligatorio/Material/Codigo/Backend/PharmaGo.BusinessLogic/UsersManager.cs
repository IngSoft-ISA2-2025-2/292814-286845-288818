using System.Text.RegularExpressions;
using PharmaGo.Domain.Entities;
using PharmaGo.Exceptions;
using PharmaGo.IBusinessLogic;
using PharmaGo.IDataAccess;
using BCrypt.Net;

namespace PharmaGo.BusinessLogic
{
    public class UsersManager : IUsersManager
    {
        private readonly IRepository<User> _userRepository;
        private readonly IRepository<Invitation> _invitationRepository;
        
        private const int BCRYPT_WORK_FACTOR = 12;
        private const int USER_CODE_LENGTH = 6;
        private const int MIN_PASSWORD_LENGTH = 8;
        
        private static readonly Regex UserCodeRegex = new(@"^[0-9]{" + USER_CODE_LENGTH + @"}$");
        private static readonly Regex EmailRegex = new(@"^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$");
        private static readonly Regex PasswordRegex = new(@"^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&.*-]).{" + MIN_PASSWORD_LENGTH + @",}$");

        public UsersManager(IRepository<User> repository, IRepository<Invitation> invitationRepository)
        {
            _userRepository = repository;
            _invitationRepository = invitationRepository;
        }

        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, BCRYPT_WORK_FACTOR);
        }

        public User CreateUser(string UserName, string UserCode, string Email, string Password, string Address, DateTime RegistrationDate)
        {
            ValidateUserInput(UserName, UserCode, Email, Password, Address);

            Invitation invitation = GetValidInvitation(UserName, UserCode);
            ValidateUserUniqueness(UserName, Email);

            User user = CreateUserEntity(UserName, Email, Password, Address, RegistrationDate, invitation);
            SaveUserAndDeactivateInvitation(user, invitation);

            return user;
        }

        private void ValidateUserInput(string userName, string userCode, string email, string password, string address)
        {
            if (string.IsNullOrEmpty(userName))
            {
                throw new InvalidResourceException("Invalid Username");
            }

            if (string.IsNullOrEmpty(userCode) || !UserCodeRegex.IsMatch(userCode))
            {
                throw new InvalidResourceException("Invalid UserCode");
            }

            if (string.IsNullOrEmpty(email) || !EmailRegex.IsMatch(email))
            {
                throw new InvalidResourceException("Invalid Email");
            }

            if (string.IsNullOrEmpty(password) || !PasswordRegex.IsMatch(password))
            {
                throw new InvalidResourceException("Invalid Password");
            }

            if (string.IsNullOrEmpty(address))
            {
                throw new InvalidResourceException("Invalid Address");
            }
        }

        private Invitation GetValidInvitation(string userName, string userCode)
        {
            Invitation invitation = _invitationRepository.GetOneDetailByExpression(x => 
                x.UserName.ToLower() == userName.ToLower() && 
                x.UserCode == userCode && 
                x.IsActive);

            if (invitation == null)
            {
                throw new ResourceNotFoundException("Invitation not found or is not currently active");
            }

            return invitation;
        }

        private void ValidateUserUniqueness(string userName, string email)
        {
            User existingUser = _userRepository.GetOneByExpression(u => u.UserName.ToLower() == userName.ToLower());
            if (existingUser != null)
            {
                throw new InvalidResourceException("Invalid Username, Username already exists");
            }

            existingUser = _userRepository.GetOneByExpression(u => u.Email.ToLower() == email.ToLower());
            if (existingUser != null)
            {
                throw new InvalidResourceException("Invalid Email, Email already exists");
            }
        }

        private User CreateUserEntity(string userName, string email, string password, string address, DateTime registrationDate, Invitation invitation)
        {
            return new User
            {
                UserName = userName,
                Email = email,
                Address = address,
                Password = HashPassword(password),
                RegistrationDate = registrationDate,
                Pharmacy = invitation.Pharmacy,
                Role = invitation.Role
            };
        }

        private void SaveUserAndDeactivateInvitation(User user, Invitation invitation)
        {
            _userRepository.InsertOne(user);

            invitation.IsActive = false;
            _invitationRepository.UpdateOne(invitation);

            _userRepository.Save();
            _invitationRepository.Save();
        }
    }

}
