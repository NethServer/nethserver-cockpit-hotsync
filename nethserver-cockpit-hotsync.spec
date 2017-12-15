Name:           nethserver-cockpit-hotsync
Version:        0.0.0
Release:        1%{?dist}
Summary:        Short description of NethServer Hotsync

License:        GPLv3
URL:            %{url_prefix}/%{name}
Source0:        %{name}-%{version}.tar.gz
# Execute prep-sources to create Source1
Source1:        nethserver-cockpit-hotsync.tar.gz
BuildArch:      noarch

BuildRequires:  nethserver-devtools
Requires:       nethserver-cockpit

%description
Very very very very very long description of NethServer Hotsync

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
