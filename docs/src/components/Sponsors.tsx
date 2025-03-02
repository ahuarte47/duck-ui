// Sponsors Component

const SponsorsList = [
  {
    name: "Ibero Data",
    logo: "https://www.iberodata.es/logo.png",
    url: "https://www.iberodata.es/?utm_source=ch-ui&utm_medium=sponsorship",
  },
  {
    name: "qxip",
    logo: "https://qxip.net/images/qxip.png",
    url: "https://qxip.net/?utm_source=duck-ui&utm_medium=sponsorship",
  },
];

export const Sponsors = () => {
  return (
    <>
      <section id="sponsors" className="sponsors-section">
        <div className="sponsors-container">
          <header className="sponsors-header">
            <h2 className="sponsors-title">Sponsors</h2>
            <p className="sponsors-subtitle">
              We would like to thank our sponsors for their support.
            </p>
          </header>

          <div className="sponsors-grid">
            {SponsorsList.map((sponsor, index) => (
              <a
                key={index}
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="sponsor-card"
              >
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="sponsor-logo"
                  loading="lazy"
                />
                <span className="sponsor-name">{sponsor.name}</span>
              </a>
            ))}
          </div>

          <div className="become-sponsor">
            <a
              href="mailto:caio.ricciuti+sponsorship@outlook.com?subject=Sponsorship%20Inquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="become-sponsor-link"
            >
              Become a sponsor
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Sponsors;
