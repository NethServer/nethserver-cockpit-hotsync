Name:           nethserver-cockpit-hotsync
Version:        0.1.4
Release:        1%{?dist}
Summary:        Short description of NethServer Hotsync

License:        GPLv3
URL:            %{url_prefix}/%{name}
Source0:        %{name}-%{version}.tar.gz
# Execute prep-sources to create Source1
Source1:        nethserver-cockpit-hotsync.tar.gz
BuildArch:      noarch

BuildRequires:  nethserver-devtools
Requires:       nethserver-cockpit, nethserver-hotsync

%description
NethServer hotsync aims to reduce downtime in case of failure. When a hardware damage occurs time to fix/buy another server and restore backup are 0 and time to install OS is 5 minutes (time to activate spare server). Users are able to start working again in few minutes, using data from a few minutes before the crash.

%prep
%setup

%build
%{makedocs}
perl createlinks

%install
(cd root ; find . -depth -not -name '*.orig' -print | cpio -dump %{buildroot})
mkdir -p %{buildroot}/usr/share/cockpit/nethserver-cockpit-hotsync/
tar xvf %{SOURCE1} -C %{buildroot}/usr/share/cockpit/nethserver-cockpit-hotsync/
%{genfilelist} %{buildroot} > filelist

%files -f filelist

%dir %{_nseventsdir}/%{name}-update

%changelog
