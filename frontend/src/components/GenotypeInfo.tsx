import React, { useState } from 'react';
import { Dna, CheckCircle2, AlertTriangle, XCircle, HeartPulse } from 'lucide-react';
import type { Genotype } from '../types/database';

export const GenotypeInfo: React.FC = () => {
  const [partner1, setPartner1] = useState<Genotype>('AS');
  const [partner2, setPartner2] = useState<Genotype>('AA');

  const calculateCompatibility = (g1: Genotype, g2: Genotype) => {
    if (g1 === 'Unknown' || g2 === 'Unknown' || g1 === 'Other' || g2 === 'Other') {
      return {
        level: 'unknown',
        message: 'Unknown genotype. Genetic testing (electrophoresis) is advised before family planning.',
        outcomes: ['Consult a medical geneticist']
      };
    }

    if (g1 === 'AA' && g2 === 'AA') {
      return {
        level: 'safe',
        message: '100% Safe: All children will inherit normal hemoglobin (AA).',
        outcomes: ['100% AA']
      };
    }

    if ((g1 === 'AA' && g2 === 'AS') || (g1 === 'AS' && g2 === 'AA')) {
      return {
        level: 'safe',
        message: 'Safe from disease: No child will have sickle cell disease (SS). 50% chance of AA, 50% chance of AS carrier.',
        outcomes: ['50% AA (Normal)', '50% AS (Carrier)']
      };
    }

    if (g1 === 'AS' && g2 === 'AS') {
      return {
        level: 'high-risk',
        message: 'High Risk: Both partners carry the sickle cell trait. Each pregnancy carries a 25% risk of Sickle Cell Disease (SS).',
        outcomes: ['25% AA (Normal)', '50% AS (Carrier)', '25% SS (Sickle Cell Disease)']
      };
    }

    if ((g1 === 'AS' && g2 === 'SS') || (g1 === 'SS' && g2 === 'AS')) {
      return {
        level: 'danger',
        message: 'Very High Risk: 50% chance of Sickle Cell Disease (SS) with every pregnancy.',
        outcomes: ['50% AS (Carrier)', '50% SS (Sickle Cell Disease)']
      };
    }

    if (g1 === 'SS' && g2 === 'SS') {
      return {
        level: 'danger',
        message: 'Extreme Risk: 100% of children will be born with Sickle Cell Disease (SS).',
        outcomes: ['100% SS (Sickle Cell Disease)']
      };
    }

    if ((g1 === 'AA' && g2 === 'SS') || (g1 === 'SS' && g2 === 'AA')) {
      return {
        level: 'safe-from-disease',
        message: 'Safe from Disease: 100% of children will be carriers (AS). Zero risk of Sickle Cell Disease (SS).',
        outcomes: ['100% AS (Carrier)']
      };
    }

    if ((g1 === 'AS' && g2 === 'AC') || (g1 === 'AC' && g2 === 'AS')) {
      return {
        level: 'high-risk',
        message: 'High Risk: 25% chance of SC disease (Hemoglobin SC Disease), 25% AA, 25% AS, 25% AC.',
        outcomes: ['25% AA', '25% AS', '25% AC', '25% SC (Disease)']
      };
    }

    return {
      level: 'caution',
      message: 'Consult a genetic counselor to review your specific hemoglobin variant combination.',
      outcomes: ['Specialist counseling recommended']
    };
  };

  const result = calculateCompatibility(partner1, partner2);

  return (
    <div className="genotype-guide-wrapper">
      <div className="guide-header">
        <h2>Genotype & Compatibility Guide</h2>
        <p className="subtitle">
          Understanding hemoglobin genotypes is critical for health prevention and proactive family planning.
        </p>
      </div>

      {/* Interactive Compatibility Checker */}
      <div className="card calculator-card">
        <div className="card-header">
          <HeartPulse size={24} className="text-crimson" />
          <h3 className="card-title">Interactive Genotype Compatibility Matcher</h3>
        </div>

        <div className="matcher-grid">
          <div className="partner-box">
            <label>Partner 1 Genotype</label>
            <select
              value={partner1}
              onChange={(e) => setPartner1(e.target.value as Genotype)}
              className="select-input"
            >
              <option value="AA">AA (Normal)</option>
              <option value="AS">AS (Carrier)</option>
              <option value="SS">SS (Disease)</option>
              <option value="AC">AC (C-Trait)</option>
              <option value="SC">SC (SC Disease)</option>
            </select>
          </div>

          <div className="cross-symbol">
            <span>+</span>
          </div>

          <div className="partner-box">
            <label>Partner 2 Genotype</label>
            <select
              value={partner2}
              onChange={(e) => setPartner2(e.target.value as Genotype)}
              className="select-input"
            >
              <option value="AA">AA (Normal)</option>
              <option value="AS">AS (Carrier)</option>
              <option value="SS">SS (Disease)</option>
              <option value="AC">AC (C-Trait)</option>
              <option value="SC">SC (SC Disease)</option>
            </select>
          </div>
        </div>

        {/* Result outcome */}
        <div className={`compatibility-result res-${result.level}`}>
          <div className="result-icon-heading">
            {result.level === 'safe' || result.level === 'safe-from-disease' ? (
              <CheckCircle2 size={24} className="text-green-600" />
            ) : result.level === 'high-risk' || result.level === 'danger' ? (
              <XCircle size={24} className="text-rose-600" />
            ) : (
              <AlertTriangle size={24} className="text-amber-600" />
            )}
            <h4>
              {result.level === 'safe'
                ? 'Compatible & Zero Disease Risk'
                : result.level === 'safe-from-disease'
                ? 'Compatible (All Children Will Be Carriers)'
                : 'High Genetic Risk for Sickle Cell Disease'}
            </h4>
          </div>

          <p className="res-message">{result.message}</p>

          <div className="outcomes-tags">
            <strong>Expected Genetic Distribution:</strong>
            <div className="tag-list">
              {result.outcomes.map((item, idx) => (
                <span key={idx} className="outcome-tag">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reference Table */}
      <div className="card table-card">
        <div className="card-header">
          <Dna size={22} className="text-crimson" />
          <h3 className="card-title">Genotype Quick Reference Table</h3>
        </div>

        <div className="table-responsive">
          <table className="history-table">
            <thead>
              <tr>
                <th>Genotype</th>
                <th>Classification</th>
                <th>Symptoms</th>
                <th>Compatibility Advice</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong className="genotype-tag tag-green">AA</strong></td>
                <td>Normal Hemoglobin</td>
                <td>None</td>
                <td>Compatible with all genotypes (AA, AS, SS, AC, SC)</td>
              </tr>
              <tr>
                <td><strong className="genotype-tag tag-yellow">AS</strong></td>
                <td>Sickle Cell Trait (Carrier)</td>
                <td>Usually asymptomatic</td>
                <td>Best to marry AA. High risk with AS, AC, SS, or SC</td>
              </tr>
              <tr>
                <td><strong className="genotype-tag tag-red">SS</strong></td>
                <td>Sickle Cell Disease / Anemia</td>
                <td>Chronic anemia, pain crises</td>
                <td>Only medically recommended with AA to avoid SS children</td>
              </tr>
              <tr>
                <td><strong className="genotype-tag tag-blue">AC</strong></td>
                <td>Hemoglobin C Trait</td>
                <td>Asymptomatic carrier</td>
                <td>Safe with AA. Avoid mating with AS or SC</td>
              </tr>
              <tr>
                <td><strong className="genotype-tag tag-purple">SC</strong></td>
                <td>Hemoglobin SC Disease</td>
                <td>Mild to moderate crises</td>
                <td>Safe with AA to prevent disease transmission</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
