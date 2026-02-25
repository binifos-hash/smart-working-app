FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["SmartWorking.API/SmartWorking.API.csproj", "SmartWorking.API/"]
COPY ["SmartWorking.Application/SmartWorking.Application.csproj", "SmartWorking.Application/"]
COPY ["SmartWorking.Infrastructure/SmartWorking.Infrastructure.csproj", "SmartWorking.Infrastructure/"]
COPY ["SmartWorking.Domain/SmartWorking.Domain.csproj", "SmartWorking.Domain/"]
RUN dotnet restore "SmartWorking.API/SmartWorking.API.csproj"

COPY . .
WORKDIR "/src/SmartWorking.API"
RUN dotnet build "SmartWorking.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SmartWorking.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "SmartWorking.API.dll"]
