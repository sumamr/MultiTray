using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MultiTrayAPI.Contracts.Requests;
using MultiTrayAPI.Domain.EntityModels;
using MultiTrayAPI.Services.Services;
using MultiTrayAPI.Services.ServicesInterface;

namespace MultiTrayAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : Controller
    {
        private readonly ICustomerService _customerService;

        public CustomerController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        [Authorize(Roles = "Admin,User")]
        [HttpPost]
        [Route("AddCustomer")]
        public async Task<IActionResult> CreateCustomer([FromBody] CustomerDTO customer)
        {
            if (customer == null)
            {
                return BadRequest("Customer data is null.");
            }

            var result = await _customerService.CreateCustomerAsync(customer);

            if (result != null)
            {
                if (!result.Success)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = result.Message
                    });
                }
                // Return the created customer data including the customerID
                return Ok(new
                {
                    success = true,
                    message = "Customer created successfully.",
                    customer = result // Include the newly created customer object
                });
            }

            return StatusCode(500, "Internal server error.");
        }

        [Authorize(Roles = "Admin,User")]
        [HttpGet]
        [Route("GetAllCustomers")]
        public async Task<IActionResult> GetAllCustomers()
        {
            //var customers = await _customerService.GetAllCustomersAsync();
            //if (customers == null || !customers.Any())
            //{
            //    return NotFound("No customers found.");
            //}

            //return Ok(customers);
            try
            {
                var result = await _customerService.GetAllCustomersAsync();
                if (result.IsSuccess)
                {
                    return Ok(result.Customers);
                }
                return BadRequest(result.ErrorMessage);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [Authorize(Roles = "Admin,User")]
        [HttpPost("UpdateCustomer")]
        public async Task<IActionResult> UpdateCustomer([FromBody] UpdateCustomerDTO customerDetails)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { Status = "Error", Message = "Invalid customer details." });
            }
            var result = await _customerService.UpdateCustomer(customerDetails);

            //if(updateCustomer == null)
            //    return NotFound(new { Status = "Error", Message = "Customer not found or update failed." });

            //// return Ok("Customer updated successfully");
            //return Ok(new { Status = "Success", Message = "Customer updated successfully" });
            if (result == null || !result.Success)
            {
                return BadRequest(new
                {
                    success = false,
                    message = result?.Message ?? "Customer not found or update failed."
                });
            }

            return Ok(new
            {
                success = true,
                message = "Customer updated successfully.",
            });
        }

        [Authorize(Roles = "Admin,User")]
        [HttpPost("UpdateCustomerStatus")]
        public async Task<IActionResult> UpdateCustomerStatus([FromBody] UpdateCustomerStatusRequest request)
        {
            if (request == null || request.CustomerID == Guid.Empty)
            {
                return BadRequest("Invalid input.");
            }

            var isUpdated = await _customerService.UpdateCustomerStatus(request.CustomerID, request.IsEnabled);
            if (isUpdated)
            {
                return Ok(new { message = "User status updated successfully." });
            }

            return NotFound(new { message = "User not found." });
        }

        [Authorize(Roles = "Admin,User")]
        [HttpPost]
        [Route("DeleteCustomer/{customerId}")]
        public async Task<IActionResult> DeleteCustomer(Guid customerId)
        {
            var result = await _customerService.DeleteCustomerByIdAsync(customerId);
            if (result.IsSuccess)
                return Ok("Customer deleted successfully");

            return BadRequest(result.ErrorMessage);
        }
        [HttpPost]
        [Route("DeleteCustomerAddress/{addressId}")]
        public async Task<IActionResult> DeleteCustomerAddress(Guid addressId)
        {
            var result = await _customerService.DeleteCustomerAddressByIdAsync(addressId);
            if (result.IsSuccess)
                return Ok("Customer Address deleted");
            return BadRequest(result.ErrorMessage);
        }

        [Authorize(Roles = "Admin,User")]
        [HttpPost("AddAddresses")]
        public async Task<IActionResult> AddOrUpdateAddress([FromBody] IEnumerable<AddressBookDTO> address, [FromQuery] Guid customerId, [FromQuery] Guid userId)
        {
            if (address == null)
            {
                return BadRequest("Address data is null.");
            }

            //var result = await _customerService.AddAddress(address, customerId, userId);
            // return Ok(new { Status = "Success", Message = "Address Added successfully." });

            //if (result)
            //{
            //    return Ok("Address successfully added.");
            //}
            //else
            //{
            //    return StatusCode(500, "An error occurred while adding/updating the address.");
            //}
            try
            {
                //  bool result = await _customerService.AddAddress(address, customerId, userId);
                await _customerService.AddAddress(address, customerId, userId);
                return Ok(new { Status = "Success", Message = "Address successfully added." });

                //if (result)
                //{
                //    return Ok(new { Status = "Success", Message = "Address successfully added." });
                //}
                //else
                //{
                //    return StatusCode(500, new { Status = "Error", Message = "An error occurred while adding/updating the address." });
                //}
            }
            catch (Exception ex)
            {
                // Log the exception for debugging (consider using a logging framework)
                Console.Error.WriteLine("Error in AddOrUpdateAddress:", ex);

                // Return a JSON error response
                return StatusCode(500, new { Status = "Error", Message = "An unexpected error occurred.", Details = ex.Message });
            }
        }
        [Authorize(Roles = "Admin,User")]
        [HttpPost("UpdateAddresses")]
        public async Task<IActionResult> UpdateAddress([FromBody] IEnumerable<UpdateAddressDTO> addressDetails, Guid customerId, Guid userId)
        {
            if (!ModelState.IsValid)
                //return BadRequest(ModelState);
                return BadRequest(new { Status = "Error", Message = "Invalid user details." });

            var updatedAddress = await _customerService.UpdateAddress(addressDetails, customerId, userId);

            if (updatedAddress == null)
                //return NotFound("User not found or update failed.");
                return NotFound(new { Status = "Error", Message = "Address not found or update failed." });

            //return Ok(updatedUser);
            return Ok(new { Status = "Success", Message = "Address updated successfully." });
        }

        [Authorize(Roles = "Admin,User")]
        [HttpGet("GetCustomerAddressByCustomerID/{customerId}")]
        public async Task<IActionResult> GetCustomerAddresses(Guid customerId)
        {
            var addresses = await _customerService.GetAddressesByCustomerIdAsync(customerId);
            if (addresses == null || !addresses.Any())
            {
                return NotFound("No addresses found for this customer.");
            }
            return Ok(addresses);
        }

        [Authorize(Roles = "Admin,User")]
        [HttpGet("GetAllCustomerDetailsByCustomerID/{customerId}")]

        public async Task<IActionResult> GetAllCustomerDetailsByCustomerID(Guid customerId)
        {

            if (customerId == Guid.Empty)
                return BadRequest(new { Status = "Error", Message = "Invalid Customer ID." });

            var result = await _customerService.GetAllCustomerDetailsByCustomerID(customerId);

            if (result == null ||
                (!result.Table1Results.Any() && !result.Table2Results.Any()))
            {
                return NotFound(new { Status = "Error", Message = "Customer not found." });
            }

            return Ok(result);
        }

        [HttpGet("GetAllIncoterms")]
        public async Task<IActionResult> GetAllIncoterms()
        {
            try
            {
                var result = await _customerService.GetAllIncoterms();
                if (result.IsSuccess)
                {
                    return Ok(result.Incoterms);
                }
                return BadRequest(result.ErrorMessage);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("GetAllPricingTypes")]
        public async Task<IActionResult> GetAllPricingTypes()
        {
            try
            {
                var result = await _customerService.GetAllPricingTypes();
                if (result.IsSuccess)
                {
                    return Ok(result.PricingTypes);
                }
                return BadRequest(result.ErrorMessage);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("GetAllTypesOfPallet")]
        public async Task<IActionResult> GetAllTypesOfPallet()
        {
            try
            {
                var result = await _customerService.GetAllTypesOfPallet();
                if (result.IsSuccess)
                {
                    return Ok(result.TypesOfPallet);
                }
                return BadRequest(result.ErrorMessage);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("GetAllTypesOfPacking")]
        public async Task<IActionResult> GetAllTypesOfPacking()
        {
            try
            {
                var result = await _customerService.GetAllTypesOfPacking();
                if (result.IsSuccess)
                {
                    return Ok(result.TypesOfPacking);
                }
                return BadRequest(result.ErrorMessage);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
        [Authorize(Roles = "Admin,User")]
        [HttpPost("CreateOrUpdateTransportAndPacking")]
        public async Task<IActionResult> CreateOrUpdateTransportAndPacking([FromBody] TransportAndPackingDTO transportAndPacking)
        {
            if (transportAndPacking == null)
            {
                return BadRequest("Transport and packing data is null.");
            }
            var result = await _customerService.CreateOrUpdateTransportAndPacking(transportAndPacking);
            if (result.IsSucess)
            {
                // Return the created customer data including the customerID
                return Ok(new
                {
                    success = true,
                    message = "Transport and Packing details added or updated successfully.",
                    transportAndPackingDetails = result.transportDetails // Include the newly created customer object
                });
            }
            return StatusCode(500, "Internal server error.");
        }
        [Authorize(Roles = "Admin,User")]
        [HttpPost("GetCustomerTransportAndPackingDetails")]
        public async Task<IActionResult> GetCustomerTransportAndPackingDetails(CustomerTransportAndPackingDetailsDTO request)
        {
            try
            {
                var result = await _customerService.GetCustomerTransportAndPackingDetails(request.AddressIDs);
                if (result.IsSuccess)
                {
                    return Ok(result.transportAndPackingDetails);
                }
                return BadRequest(result.ErrorMessage);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
        [Authorize(Roles = "Admin,User")]
        [HttpPost("GetPackingTypesByTypeOfPackingID")]
        public async Task<IActionResult> GetPackingTypesByTypeOfPackingID(GetPackingTypesByTypeOfPackingIDDTO request)
        {
            try
            {
                var result = await _customerService.GetPackingTypesByTypeOfPackingID(request.TypeOfPallet, request.TypeOfPackingID);
                if (result.IsSuccess)
                {
                    return Ok(result.PackingTypes);
                }
                return BadRequest(result.ErrorMessage);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
        [Authorize(Roles = "Admin,User")]
        [HttpPost("GetTransportationCostForEachLocation")]
        public async Task<IActionResult> GetTransportationCostForEachLocation(GetTransportationCostForEachLocationDTO request)
        {
            try
            {
                var result = await _customerService.GetTransportationCostForEachLocation(request);
                if (result.IsSuccess)
                {
                    return Ok(result.TrasnportationCost);
                }
                return BadRequest(result.ErrorMessage);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        //[HttpGet("{customerID}")]
        //public async Task<IActionResult> GetCustomerPOCDetails(Guid customerID)
        //{
        //    var result = await _customerService.GetCustomerPOCDetailsAsync(customerID);
        //    if (result == null)
        //    {
        //        return NotFound();
        //    }
        //    return Ok(result);
        //}
        [Authorize(Roles = "Admin,User")]
        [HttpGet("{customerID}")]
        public async Task<IActionResult> GetCustomerPOCDetails(Guid customerID)
        {
            var result = await _customerService.GetCustomerPOCDetailsAsync(customerID);
            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        //[Authorize(Roles = "Admin,User")]
        [HttpGet("CheckAddressesWithTransportCost")]
        public async Task<IActionResult> CheckAddressesWithTransportCost(string addressIDs)
        {
            var result = await _customerService.CheckAddressesWithTransportCost(addressIDs);
            if (result.IsSuccess)
            {
                return Ok(result.AddressIDs);
            }
            return BadRequest(result.ErrorMessage);
        }
        [HttpPost("UpdateTransportationCostToZero")]
        public async Task<IActionResult> UpdateTransportationCostToZero(UpdateTransportationCostToZero request)
        {
            var result = await _customerService.UpdateTransportationCostToZero(request);
            if (result.IsSuccess)
            {
                return Ok(result.AddressIDs);
            }
            return BadRequest(result.ErrorMessage);
        }


        [HttpGet("CheckIfCustomerAssociatedWithQuote/{customerID}")]
        public async Task<IActionResult> CheckIfCustomerAssociatedWithQuote(Guid customerID)
        {
            try
            {
                var result = await _customerService.CheckIfCustomerAssociatedWithQuote(customerID);

                return Ok(result);

            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }

        }


        [HttpGet("CheckAddressUsedInTransportAndPacking/{addressID}")]
        public async Task<IActionResult> CheckAddressUsedInTransportAndPacking(Guid addressID)
        {
            bool isInUse = await _customerService.CheckAddressUsedInTransportAndPacking(addressID);
            return Ok(isInUse);
        }

    }
}
