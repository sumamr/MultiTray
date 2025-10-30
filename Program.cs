using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MultiTrayAPI.Data.Repository;
using MultiTrayAPI.Data.RepositoryInterfaces;
using MultiTrayAPI.Services.Services;
using MultiTrayAPI.Services.ServicesInterface;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var key= Encoding.UTF8.GetBytes(builder.Configuration.GetValue<string>("ApplicationSettings:Secret"));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter 'Bearer' followed by a space and the JWT token. Example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});


builder.Services.AddAuthorization();

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICommonRepository, CommonRepository>();
builder.Services.AddScoped<ICommonService, CommonService>();
builder.Services.AddScoped<ILoginService, LoginService>();
builder.Services.AddScoped<ILoginRepository, LoginRepository>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ICustomerRFQService, CustomerRFQService>();
builder.Services.AddScoped<IQuoteRepository, QuoteRepository>();
builder.Services.AddScoped<IQuoteService, QuoteService>();
builder.Services.AddScoped<IRawMaterialRepository, RawMaterialRepository>();
builder.Services.AddScoped<IRawMaterialService, RawMaterialService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IColorService, ColorService>();
builder.Services.AddScoped<IColorRepository, ColorRepository>();
builder.Services.AddScoped<ICustomerRFQRepository, CustomerRFQRepository>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IPricingService, PricingService>();
builder.Services.AddScoped<IPriceRepository, PriceRepository>();

builder.Services.AddCors(p => p.AddPolicy("corsapp", builder =>
{
    //builder.WithOrigins("http://localhost:4200")  // Allow only your frontend
    //       .AllowAnyMethod()
    //       .AllowAnyHeader();
    builder.WithOrigins("*")
           .AllowAnyMethod()
           .AllowAnyHeader();
}));

builder.Services.AddSession(options =>
{
    options.Cookie.Name = "LoginSession";
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Set session expiration
});

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "MultiTrayApi", Version = "v1" });
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddMemoryCache();
builder.Services.AddHttpContextAccessor();


builder.Services.AddDistributedMemoryCache();

var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("v1/swagger.json", "V1");
    });
}
/* Swagger UI for the API after deployment/hosting on Server */

app.UseSwagger();

app.UseSwaggerUI();

app.UseSwaggerUI(c =>

{
    c.SwaggerEndpoint("v1/swagger.json", "V1");
});
app.UseCors("corsapp");

app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthorization();

app.MapControllers();

app.Run();